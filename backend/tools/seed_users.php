<?php

require __DIR__ . '/../vendor/autoload.php';

use src\Database;
use src\Models\UserModel;

$dsn = 'sqlite:' . __DIR__ . '/../database/transcendence.db';
$database = new Database($dsn);
$userModel = new UserModel($database);

$seedUsers = [
    [
        'username'    => 'the_dudette',
        'displayname' => 'the_dudette',
        'email'       => 'player1@example.com',
        'password'    => 'Password42!',
    ],
    [
        'username'    => 'mr_best',
        'displayname' => 'mr_best',
        'email'       => 'player2@example.com',
        'password'    => 'Password42!',
    ],
    [
        'username'    => 'hotdog_95',
        'displayname' => 'hotdog_95',
        'email'       => 'player3@example.com',
        'password'    => 'Password42!',
    ],
    [
        'username'    => 'bigbozz',
        'displayname' => 'bigbozz',
        'email'       => 'player4@example.com',
        'password'    => 'Password42!',
    ],
    [
        'username'    => 'littlebozz',
        'displayname' => 'littlebozz',
        'email'       => 'player5@example.com',
        'password'    => 'Password42!',
    ],
    [
        'username'    => 'bannansplit',
        'displayname' => 'bannansplit',
        'email'       => 'player6@example.com',
        'password'    => 'Password42!',
    ],
    [
        'username'    => 'yoda',
        'displayname' => 'yoda',
        'email'       => 'player7@example.com',
        'password'    => 'Password42!',
    ],
    [
        'username'    => 'sqqqqr5',
        'displayname' => 'sqqqqr5',
        'email'       => 'player8@example.com',
        'password'    => 'Password42!',
    ],
];

foreach ($seedUsers as $data) {
    $existing = $userModel->getUserByUsername($data['username']);
    if ($existing) {
        echo "[seed] User {$data['username']} already exists, skipping\n";
        continue;
    }

    $hash = password_hash($data['password'], PASSWORD_DEFAULT);

    $id = $userModel->createUser(
        $data['username'],
        $data['displayname'],
        $data['email'],
        $hash
    );

    if ($id === null) {
        echo "[seed] Failed to create user {$data['username']}\n";
    } else {
        echo "[seed] Created user {$data['username']} with id {$id}\n";
    }
}

echo "[seed] Done.\n";