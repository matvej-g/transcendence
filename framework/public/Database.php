<?php


class Database {

	public $connection;

	// establishing connection by passing $path to database
	public function __construct($dsn)
	{
		$this->connection = new PDO($dsn);
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

