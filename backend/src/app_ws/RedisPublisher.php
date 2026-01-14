<?php declare(strict_types=1);

namespace src\app_ws;

final class RedisPublisher
{
    private string $host;
    private int $port;
    private string $channel;

    public function __construct(
        ?string $host = null,
        ?int $port = null,
        string $channel = 'app-events'
    ) {
        $this->host = $host ?? (getenv('REDIS_HOST') ?: 'redis');
        $this->port = $port ?? (int)(getenv('REDIS_PORT') ?: 6379);
        $this->channel = $channel;
    }

    public function publish(string $type, array $data): void
    {
        $payload = json_encode(['type' => $type, 'data' => $data], JSON_UNESCAPED_UNICODE);
        if ($payload === false) return;

        $fp = @fsockopen($this->host, $this->port, $errno, $errstr, 1.0);
        if (!$fp) return;

        $cmd =
            "*3\r\n" .
            "$7\r\nPUBLISH\r\n" .
            "$" . strlen($this->channel) . "\r\n" . $this->channel . "\r\n" .
            "$" . strlen($payload) . "\r\n" . $payload . "\r\n";

        fwrite($fp, $cmd);
        fclose($fp);
    }
}