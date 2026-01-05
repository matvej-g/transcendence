<?php

namespace src;

class Sanitiser {

	public static function normaliseStrings(array $strings): array
	{
		return array_map(fn($str) => strtolower(trim($str)), $strings);
	}

	public static function normaliseMessage($message): string
	{
		$message = preg_replace('/\p{C}+/u', '', $message);
		$message = preg_replace('/[ \t]{2,}/', ' ', $message); 
		$message = trim($message);
		return $message;
	}
}