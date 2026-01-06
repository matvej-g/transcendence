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

	public static function validateEmail($email)
	{
		return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
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

		if (strlen($value) > 10) {
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

	//============ User validation ============//
	private static function validatePassword($password): bool
	{
		return self::validateString($password, 8, 72);
	}

	private static function validateUserName($userName): ?string
	{
		$userName = trim($userName);
		if (!preg_match('/^[a-zA-Z0-9._-]+$/', $userName)) {
        	return 'invalid characters';
    	}
		if (!self::validateString($userName, 1, 30)) {
			return 'invalid length';
		}

		$reservedUserNames = [
			'admin', 'root', 'system', 'support', 'api', 'me'
		];
		if (in_array(strtolower($userName), $reservedUserNames, true)) {
			return 'reserved username';
		}

		return null;
	}

	public static function validateUpdateUserData($userName, $email, $password = null)
	{
		$errors = [];

		if (!$userName || !$email) {
			$errors['Input'] = 'missing';
			return $errors;
		}

		$error = self::validateUserName($userName);
		if ($error !== null) {
			$errors['userName'] = $error;
		}
		if (!self::validateEmail($email)) {
			$errors['email'] = 'invalid';
		}
		if ($password !== null) {
			if (!self::validatePassword($password)) {
				$errors['password'] = 'invalid';
			}
		}

		return $errors;
	}

	public static function validateNewUserData($userName, $email, $password)
	{
		$errors = [];

		if (!$userName || !$email || !$password) {
			$errors['Input'] = 'missing';
			return $errors;
		}

		$error = self::validateUserName($userName);
		if ($error !== null) {
			$errors['userName'] = $error;
		}
		if (!self::validateEmail($email)) {
			$errors['email'] = 'invalid';
		}
		if (!self::validatePassword($password)) {
			$errors['password'] = 'invalid';
		}

		return $errors;
	}

	public static function caseInsensitiveComparison($current, $stored)
	{
		return strtolower($current) === strtolower($stored);
	}
}
