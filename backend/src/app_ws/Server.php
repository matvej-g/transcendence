<?php
require __DIR__ . '/../../vendor/autoload.php';

use Ratchet\Server\IoServer;
use Ratchet\Http\HttpServer;
use Ratchet\WebSocket\WsServer;
use React\Socket\SocketServer;
use src\app_ws\AppServer;

// health check for Redis
use src\app_ws\RedisPing;

pcntl_async_signals(true);

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


$redis->on('message', function ($channel, $payload) use ($app) {
    $msg = json_decode((string)$payload, true);
    if (!is_array($msg) || !isset($msg['type'], $msg['data'])) return;

    $type = (string)$msg['type'];
    $data = is_array($msg['data']) ? $msg['data'] : [];
    if ($type === '') return;

    $cid = (string)($data['conversationId'] ?? '');
    $convRoom = $cid !== '' ? "conversation:$cid" : '';

    // 1) conversation broadcast (if present)
    if ($convRoom !== '') {
        $app->broadcastRoom($convRoom, ['type' => $type, 'data' => $data]);
    }

    // 2) user broadcast (if present)
    $recipients = $data['recipientUserIds'] ?? [];
    if (is_array($recipients)) {
        foreach ($recipients as $uid) {
            if (!is_int($uid) && !(is_string($uid) && ctype_digit($uid))) continue;
            $uid = (int)$uid;
            if ($uid <= 0) continue;

            // For message.*: send to user room only if the socket is NOT in the convo room
            if (str_starts_with($type, 'message.') && $convRoom !== '') {
                $app->broadcastUserExceptRoom($uid, $convRoom, ['type' => $type, 'data' => $data]);
            } else {
                $app->broadcastRoom("user:$uid", ['type' => $type, 'data' => $data]);
            }
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

$shutdown = function (string $signal) use ($loop, $socket) {
    echo "Received {$signal}, shutting down...\n";

    $socket->close();
    $loop->stop();

    echo "Shutdown complete\n";
};

pcntl_signal(SIGTERM, fn() => $shutdown('SIGTERM'));
pcntl_signal(SIGINT,  fn() => $shutdown('SIGINT'));

echo "WS app server listening on :8082\n";
$loop->run();