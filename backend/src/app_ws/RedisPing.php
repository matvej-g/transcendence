<?php declare(strict_types=1);

namespace src\app_ws;

final class RedisPing
{
    public function __construct(
        private readonly string $host,
        private readonly int $port,
        private readonly float $timeoutSec = 1.0
    ) {}

    /** returns true if we got +PONG */
    public function ping(): bool
    {
        $fp = @fsockopen($this->host, $this->port, $errno, $errstr, $this->timeoutSec);
        if (!$fp) return false;

        stream_set_timeout($fp, (int)$this->timeoutSec, (int)(($this->timeoutSec - (int)$this->timeoutSec) * 1_000_000));

        // RESP: *1\r\n$4\r\nPING\r\n
        $cmd = "*1\r\n$4\r\nPING\r\n";
        fwrite($fp, $cmd);

        $line = fgets($fp);
        fclose($fp);

        return is_string($line) && str_starts_with($line, "+PONG");
    }
}