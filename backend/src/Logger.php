<?php

namespace src;

class Logger {

	private string $infoLog;
	private string $errorLog;
	private string $debugLog;

	public function __construct()
	{
		$logDir = BASE_PATH . '/tmp/logs';
		if (!is_dir($logDir)) {
			mkdir($logDir, 0777, true);
		}

		$this->infoLog = "$logDir/info.log";
		$this->errorLog = "$logDir/error.log";
		$this->debugLog = "$logDir/debug.log";
	}

	public function info(string $message, array $context = []): void {
		$this->log("INFO", $message, $context);
	}

	public function error(string $message, array $context = []): void {
		$this->log("ERROR", $message, $context);
	}

	public function debug(string $message, array $context = []): void {
		$this->log("DEBUG", $message, $context);
	}

	private function log(string $level, string $message, array $context): void {
		$time = date('Y-m-d H:i:s');

		if (empty($context)) {
			$contextText = '';
		} else {
			$contextText = " " . json_encode($context);
		}
		$entry = "[$time] [$level]: $message$contextText" . PHP_EOL;
		$logFile = match ($level) {
			"ERROR" => $this->errorLog,
			"DEBUG" => $this->debugLog,
			default => $this->infoLog
		};
		file_put_contents($logFile, $entry, FILE_APPEND);
	}
}
