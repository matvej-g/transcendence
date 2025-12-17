<?php
namespace Pong;

use Ratchet\ConnectionInterface;

class Player {
    public ConnectionInterface $conn;

    //Game State
    public ?string $paddle = null;
    public ?string $gameID = null;
    public int $score = 0;

    //User data (set by database)
    public string $userID;
    public string $username = '';

    //Session
    public string $sessionID;
    public bool $isAuthenticated = false;

    public function __construct(ConnectionInterface $conn) {
        $this->conn = $conn;
        $this->sessionID = uniqid('session_', true);
    }
    
    //called by GameServer.php
    public function setUserData(array $userData): void {
        $this->userID = (int)$userData['id'];
        $this->username = $userData['username'];
        $this->isAuthenticated = true;
    }

    public function send(array $data): void {
        $this->conn->send(json_encode($data));
    }

    public function getPublicInfo(): array {
        return [
            'userID' => $this->userID,
            'username' => $this->username,
            'score' => $this->score,
            'paddle' => $this->paddle
        ];
    }

    public function isReady(): bool {
        return $this->isAuthenticated && !empty($this->username);
    }

}

//Databases

// - id (Primary Key)
// - username (Unique)
// - email (Unique)
// - password_hash
// - created_at


// - id (Primary Key)
// - player_one_id → users(id)
// - player_two_id → users(id)
// - score_player_one
// - score_player_two
// - winner_id → users(id)
// - started_at
// - finished_at