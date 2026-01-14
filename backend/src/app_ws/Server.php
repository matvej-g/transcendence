<?php
require __DIR__ . '/../../vendor/autoload.php';

use Ratchet\Server\IoServer;
use Ratchet\Http\HttpServer;
use Ratchet\WebSocket\WsServer;
use React\Socket\SocketServer;
use src\app_ws\AppServer;

// health check for Redis
use src\app_ws\RedisPing;

// env
$redisHost = getenv('REDIS_HOST') ?: 'redis';
$redisPort = (int)(getenv('REDIS_PORT') ?: 6379);

// ---- Wait for Redis before starting WS ----
$ping = new RedisPing($redisHost, $redisPort);

$deadline = microtime(true) + 30.0; // wait up to 30s
while (microtime(true) < $deadline) {
    if ($ping->ping()) {
        echo "[ws_app] Redis is ready at {$redisHost}:{$redisPort}\n";
        break;
    }
    echo "[ws_app] Waiting for Redis at {$redisHost}:{$redisPort}...\n";
    usleep(500_000); // 0.5s
}

if (!$ping->ping()) {
    fwrite(STDERR, "[ws_app] Redis not reachable after 30s, exiting.\n");
    exit(1); // docker restart: on-failure will retry
}
// health check done

$loop = React\EventLoop\Loop::get();

$app = new AppServer();

// Subscribe to Redis channel and broadcast events
$redisUrl = getenv('REDIS_URL') ?: 'redis://redis:6379';
$factory = new Clue\React\Redis\Factory($loop);
$redis = $factory->createLazyClient($redisUrl);

$redis->subscribe('app-events');

// $redis->on('message', function ($channel, $payload) use ($app) {
// 	echo "[ws_app] redis message channel={$channel} payload={$payload}\n";

//     $msg = json_decode((string)$payload, true);
//     if (!is_array($msg)) {
// 		echo "[ws_app][redis] payload is not valid JSON\n";
// 		return;
// 	}
// 	if (!isset($msg['type'], $msg['data'])){
// 		echo "[ws_app][redis] missing keys. keys=" . implode(',', array_keys($msg)) . "\n";
// 		return ;
// 	} 

//     if ($msg['type'] === 'message.created') {
//         $cid = (string)($msg['data']['conversationId'] ?? '');
//         if ($cid === '') {
// 			echo "[ws_app][redis] message.created without conversationId\n";
// 			return;
// 		}

//         $app->broadcastRoom("conversation:$cid", [
//             'type' => 'message.created',
//             'data' => $msg['data'],
//         ]);
//     }
// });

$redis->on('message', function ($channel, $payload) use ($app) {
	echo "[ws_app] redis message channel={$channel} payload={$payload}\n";

	$msg = json_decode((string)$payload, true);
	if (!is_array($msg) || !isset($msg['type'], $msg['data'])) {
		echo "[ws_app] bad payload (expected {type,data})\n";
		return;
	}

	if ($msg['type'] !== 'message.created') return;

	$cid = (string)($msg['data']['conversationId'] ?? '');
	if ($cid === '') return;

	// 1) send to everyone who joined the conversation room (chat page open)
	$app->broadcastRoom("conversation:$cid", [
		'type' => 'message.created',
		'data' => $msg['data'],
	]);

	// 2) send to specific users (for notifications even if they never opened chat)
	$recipients = $msg['data']['recipientUserIds'] ?? [];
	if (is_array($recipients)) {
		foreach ($recipients as $uid) {
			if (!is_int($uid) && !(is_string($uid) && ctype_digit($uid))) continue;
			$uid = (int)$uid;
			if ($uid <= 0) continue;

			$app->broadcastRoom("user:$uid", [
				'type' => 'message.created',
				'data' => $msg['data'],
			]);
		}
	}
});

// IMPORTANT: use 8082 (game uses 8081)
$socket = new SocketServer('0.0.0.0:8082', [], $loop);

$server = new IoServer(
    new HttpServer(new WsServer($app)),
    $socket,
    $loop
);

echo "WS app server listening on :8082\n";
$loop->run();