<?php

namespace src;

class Validator
{
	public static function validateString($value, $min = 1, $max = PHP_INT_MAX)
	{
		if (!is_string($value))
			return false;
		$value = trim($value);
		return strlen($value) >= $min && strlen($value) <= $max;
	}

	public static function validateEmail($value)
	{
		return filter_var($value, FILTER_VALIDATE_EMAIL);
	}
}