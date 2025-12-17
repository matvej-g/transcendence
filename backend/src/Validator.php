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


	public static function validateUpdateUserData($userName, $email, $password = null) {
		$errors = [];

		if (!$userName || !$email)
			$errors['Input'] = 'missing';
		if (!self::validateString($userName, 1, 15))
			$errors['userName'] = 'invalid';
		if (!self::validateEmail($email))
			$errors['email'] = 'invalid';
		if ($password !== null) {
			if (!self::validateString($password, 3, 15))
				$errors['password'] = 'invalid';
		}

		return $errors;
	}

	public static function validateNewUserData($userName, $email, $password) {
		$errors = [];

		if (!$userName || !$email || !$password)
			$errors['Input'] = 'missing';
		if (!self::validateString($userName, 1, 15))
			$errors['userName'] = 'invalid';
		if (!self::validateEmail($email))
			$errors['email'] = 'invalid';
		if (!self::validateString($password, 3, 15))
			$errors['password'] = 'invalid';

		return $errors;
	}
}