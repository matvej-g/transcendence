<?php
require __DIR__ . '/../../vendor/autoload.php';

use Ratchet\Server\IoServer;
use Ratchet\Http\HttpServer;
use Ratchet\WebSocket\WsServer;
use React\Socket\SocketServer;
use Pong\GameServer;

pcntl_async_signals(true);

// Create event loop, manages all asynchronous operations
$loop = React\EventLoop\Loop::get();

// Create WebSocket server, with websocket protocol RFC 6455
$webSocketServer = new WsServer(new GameServer($loop));

// Create HTTP server, handles HTTP protocol, start as HTTP then upgrade to WebSocket Protocol
$httpServer = new HttpServer($webSocketServer);

// Create socket server with the loop, listening on port 8080, non blocking, handles multiple connections
$socket = new SocketServer('0.0.0.0:8080', [], $loop);

// Create IoServer, Message router between network layer and application layer
$ioServer = new IoServer($httpServer, $socket, $loop);

echo "WebSocket server started on port 8080\n";

$shutdown = function (string $signal) use ($loop, $socket) {
    echo "Received {$signal}, shutting down...\n";

    $socket->close();
    $loop->stop();

    echo "Shutdown complete\n";
};

pcntl_signal(SIGTERM, fn() => $shutdown('SIGTERM'));
pcntl_signal(SIGINT,  fn() => $shutdown('SIGINT'));

// Run the event loop
$loop->run();

exit(0);