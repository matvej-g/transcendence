<?php

namespace src;

class Validator
{
	public static function validateString($value, $min = 1, $max = PHP_INT_MAX)
	{
		if (!is_string($value)) {
			return false;
		}
		$value = trim($value);
		return strlen($value) >= $min && strlen($value) <= $max;
	}

	public static function validateEmail($value)
	{
		return filter_var($value, FILTER_VALIDATE_EMAIL) !== false;
	}


	public static function validateId($value): bool
	{
		if ($value === null) {
			return false;
		}

		if (is_int($value)) {
			return $value > 0;
		}

		if (!is_string($value)) {
			return false;
		}
		
		return ctype_digit($value) && (int)$value > 0;
	}

	public static function validateIdArray($values): bool
	{
		if (!is_array($values) || count($values) === 0) {
			return false;
		}

		foreach ($values as $v) {
			if (!self::validateId($v)) {
				return false;
			}
		}

		return true;
	}

	public static function validateTournamentName($value): bool
	{
		return self::validateString($value, 1, 50);
	}

	public static function validateMessageText($value): bool
	{
		return self::validateString($value, 1, 1000);
	}

	public static function validateUpdateUserData($userName, $email, $password = null)
	{
		$errors = [];

		if (!$userName || !$email) {
			$errors['Input'] = 'missing';
		}
		if (!self::validateString($userName, 1, 15)) {
			$errors['userName'] = 'invalid';
		}
		if (!self::validateEmail($email)) {
			$errors['email'] = 'invalid';
		}
		if ($password !== null) {
			if (!self::validateString($password, 3, 15)) {
				$errors['password'] = 'invalid';
			}
		}

		return $errors;
	}

	public static function validateNewUserData($userName, $email, $password)
	{
		$errors = [];

		// keine leerzeichen
		// Problematische Sonderzeichen in url
		// umlaute 
		// konvertieren oder error
		if (!$userName || !$email || !$password) {
			$errors['Input'] = 'missing';
		}
		if (!self::validateString($userName, 1, 15)) {
			$errors['userName'] = 'invalid';
		}
		if (!self::validateEmail($email)) {
			$errors['email'] = 'invalid';
		}
		if (!self::validateString($password, 3, 15)) {
			$errors['password'] = 'invalid';
		}

		return $errors;
	}
}
