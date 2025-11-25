<?php

use src\controllers\MatchesController;
use src\controllers\TournamentController;
use src\controllers\UserController;
use src\controllers\AuthController;

// pages
$this->router->get('/', 'src/controllers/home.php');
$this->router->get('/about', 'src/controllers/about.php');
$this->router->get('/contact', 'src/controllers/contact.php');
$this->router->get('/dashboard', 'src/controllers/dashboard.php');

// Database
// $this->router->post('/register', [UserController::class, 'register']);
$this->router->get('/users/show', [UserController::class, 'showUsers']);
$this->router->post('/users/add', [UserController::class, 'addUser']);

//2FA routes
$this->router->get('/send-2fa', [AuthController::class, 'sendTwoFactorCode']);
$this->router->get('/verify-2fa', [AuthController::class, 'verifyTwoFactorCode']);
$this->router->get('/issueJWT', 'src/controllers/issueJWT.php'); //----------
$this->router->post('/verify-2fa', [AuthController::class, 'verifyTwoFactorCode']);
$this->router->get('/game', 'src/controllers/game.php');

// users
$this->router->get('/api/users', [UserController::class, 'getUsers']);
$this->router->get('/api/user/{id}', [UserController::class, 'getUser']);
// $this->router->get('/api/user/{userName}', [UserController::class, 'getUserByName']);
$this->router->post('/api/user/new', [UserController::class, 'newUser']);
$this->router->post('/api/user/login', [UserController::class, 'userLogin']);

// matches
$this->router->get('/api/matches', [MatchesController::class, 'getMatches']);
$this->router->get('/api/match/{id}', [MatchesController::class, 'getMatch']);
$this->router->post('/api/match/new', [MatchesController::class, 'newMatch']);

// tournaments
$this->router->get('/api/tournaments', [TournamentController::class, 'getTournaments']);
$this->router->get('/api/tournament/{id}', [TournamentController::class, 'getTournament']);
$this->router->post('/api/tournament/new', [TournamentController::class, 'newTournament']);

