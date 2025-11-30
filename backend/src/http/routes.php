<?php

use src\controllers\MatchesController;
use src\controllers\TournamentController;
use src\controllers\UserController;

// pages
$this->router->get('/game', 'src/controllers/game.php');

// users
$this->router->get('/api/users', [UserController::class, 'getUsers']);
$this->router->get('/api/user/{id}', [UserController::class, 'getUser']);
$this->router->get('/api/user/{email}', [UserController::class, 'getUserByEmail']);
$this->router->get('/api/user/{userName}', [UserController::class, 'getUserByUsername']);
$this->router->post('/api/user/new', [UserController::class, 'newUser']);
$this->router->post('/api/user/login', [UserController::class, 'userLogin']);
$this->router->patch('/api/user/update', [UserController::class, 'updateUser']);
$this->router->patch('/api/user/changePassword', [UserController::class, 'changePassword']);
$this->router->delete('/api/user/{id}', [UserController::class, 'deleteUser']);

// matches
$this->router->get('/api/matches', [MatchesController::class, 'getMatches']);
$this->router->get('/api/match/{id}', [MatchesController::class, 'getMatch']);
$this->router->post('/api/match/new', [MatchesController::class, 'newMatch']);
$this->router->patch('/api/match/{id}/end', [MatchesController::class, 'endMatch']);
$this->router->patch('/api/match/{id}', [MatchesController::class, 'updateScore']);

// tournaments
$this->router->get('/api/tournaments', [TournamentController::class, 'getTournaments']);
$this->router->get('/api/tournament/{id}', [TournamentController::class, 'getTournament']);
$this->router->post('/api/tournament/new', [TournamentController::class, 'newTournament']);

