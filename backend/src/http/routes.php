<?php

use src\controllers\MatchesController;
use src\controllers\UserController;
use src\controllers\AuthController;
use src\Middleware\AuthMiddleware;
use src\Middleware\Require2FAMiddleware;

// pages
$this->router->get('/', 'src/controllers/home.php');
$this->router->get('/about', 'src/controllers/about.php');
$this->router->get('/contact', 'src/controllers/contact.php');
$this->router->get('/dashboard', 'src/controllers/dashboard.php');

// Database
// $this->router->post('/register', [UserController::class, 'register']);
$this->router->get('/users/show', [UserController::class, 'showUsers']);
$this->router->post('/users/add', [UserController::class, 'addUser']);

//2FA routes (API endpoints) - Require basic auth (JWT) but not 2FA yet
$this->router->post('/api/auth/send-2fa', [AuthController::class, 'sendTwoFactorCode'], [AuthMiddleware::class]);
$this->router->post('/api/auth/verify-2fa', [AuthController::class, 'verifyTwoFactorCode'], [AuthMiddleware::class]);

$this->router->get('/game', 'src/controllers/game.php');

// Public user routes - no auth required
use src\controllers\TournamentController;
use src\controllers\TournamentPlayerController;
use src\controllers\TournamentMatchesController;

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

// Protected user routes - require full auth + 2FA
$this->router->get('/api/users', [UserController::class, 'getUsers'], [Require2FAMiddleware::class]);
$this->router->get('/api/user/{id}', [UserController::class, 'getUser'], [Require2FAMiddleware::class]);
// $this->router->get('/api/user/{userName}', [UserController::class, 'getUserByName']);

// Protected match routes - require full auth + 2FA
$this->router->get('/api/matches', [MatchesController::class, 'getMatches'], [Require2FAMiddleware::class]);
$this->router->get('/api/match/{id}', [MatchesController::class, 'getMatch'], [Require2FAMiddleware::class]);
$this->router->post('/api/match/new', [MatchesController::class, 'newMatch'], [Require2FAMiddleware::class]);

// Protected tournament routes - require full auth + 2FA
$this->router->get('/api/tournaments', [TournamentController::class, 'getTournaments'], [Require2FAMiddleware::class]);
$this->router->get('/api/tournament/{id}', [TournamentController::class, 'getTournament'], [Require2FAMiddleware::class]);
$this->router->post('/api/tournament/new', [TournamentController::class, 'newTournament'], [Require2FAMiddleware::class]);
// matches
$this->router->get('/api/matches', [MatchesController::class, 'getMatches']);
$this->router->get('/api/match/{id}', [MatchesController::class, 'getMatch']);
$this->router->post('/api/match/new', [MatchesController::class, 'newMatch']);
$this->router->patch('/api/match/{id}/end', [MatchesController::class, 'endMatch']);
$this->router->patch('/api/match/{id}', [MatchesController::class, 'updateScore']);
$this->router->delete('/api/match/{id}', [MatchesController::class, 'deleteMatch']);

// tournaments
$this->router->get('/api/tournaments', [TournamentController::class, 'getTournaments']);
$this->router->get('/api/tournament/{id}', [TournamentController::class, 'getTournament']);
$this->router->get('/api/tournament/{name}', [TournamentController::class, 'getTournamentByName']);
$this->router->post('/api/tournament/new', [TournamentController::class, 'newTournament']);
$this->router->patch('/api/tournament/{id}', [TournamentController::class, 'endTournament']);
$this->router->delete('/api/tournament/{id}', [TournamentController::class, 'deleteTournament']);

// tournament players
$this->router->get('/api/tournament/{id}/players', [TournamentPlayerController::class, 'getTournamentPlayers']);
$this->router->post('/api/tournament/{id}/player', [TournamentPlayerController::class, 'newTournamentPlayer']);
$this->router->patch('/api/tournament/player/{id}', [TournamentPlayerController::class, 'updateTournamentPlayer']);
$this->router->delete('/api/tournament/player/{id}', [TournamentPlayerController::class, 'deleteTournamentPlayer']);

// tournament matches
$this->router->get('/api/tournament/matches', [TournamentMatchesController::class, 'getTournamentMatches']);
$this->router->get('/api/tournament/match/{id}', [TournamentMatchesController::class, 'getTournamentMatch']);
$this->router->post('/api/tournament/match/new', [TournamentMatchesController::class, 'newTournamentMatch']);
$this->router->patch('/api/tournament/match/{id}', [TournamentMatchesController::class, 'updateTournamentMatch']);
$this->router->delete('/api/tournament/match/{id}', [TournamentMatchesController::class, 'deleteTournamentMatch']);
