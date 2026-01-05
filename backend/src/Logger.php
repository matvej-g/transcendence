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
			// if (!@mkdir($logDir, 0775, true) && !is_dir($logDir))
			// 	{
				throw new \RuntimeException("Failed to create log directory: {$logDir}");
			// }
			@chmod($logDir, 0775);
		}

		if (!is_writable($logDir)) {
			throw new \RuntimeException("Log directory is not writable: {$logDir}");
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
			$json = json_encode($context, JSON_PARTIAL_OUTPUT_ON_ERROR);
			if ($json === false) {
				$contextText = ' [context_encoding_error]';
			} else {
				$contextText = ' ' . $json;
			}
		}
		$entry = "[$time] [$level]: $message$contextText" . PHP_EOL;
		$logFile = match (strtoupper($level)) {
			"ERROR" => $this->errorLog,
			"DEBUG" => $this->debugLog,
			default => $this->infoLog
		};

		// Attempt to write with exclusive lock; throw on failure (fail-fast).
		$result = @file_put_contents($logFile, $entry, FILE_APPEND | LOCK_EX);
		if ($result === false) {
			// write to PHP error_log as a last-resort and then throw
			error_log("[LOGGER] Failed to write to {$logFile}: {$entry}");
			throw new \RuntimeException("Failed to write to log file: {$logFile}");
		}
	}
}
