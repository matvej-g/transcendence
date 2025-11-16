<?php

namespace src;

use PDO;

class Database {

	public $connection;

	// establishing connection by passing $path to database
	// enable foreign keys
	public function __construct($dsn)
	{
		$this->connection = new PDO($dsn);
		$this->connection->exec("PRAGMA foreign_keys = ON;");
	}

	// reconsider accessability
	// simple query function
	public function query($query, $parmas = [])
	{
		$statement = $this->connection->prepare($query);
		$statement->execute($parmas);

		return $statement;
	}
}

