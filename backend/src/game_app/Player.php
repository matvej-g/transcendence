<?php
namespace App;

use Ratchet\ConnectionInterface;

class Player {
    public ConnectionInterface $conn;
    public ?string $paddle = null;
    public ?string $gameID = null;
    public ?string $username = null;
    public ?string $userID = null;
    public int $score = 0;
    
    public function __construct(ConnectionInterface $conn) {
        $this->conn = $conn;
    }
    
    public function send(array $data): void {
        $this->conn->send(json_encode($data));
    }
}