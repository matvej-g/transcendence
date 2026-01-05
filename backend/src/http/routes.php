<?php

use src\controllers\MatchesController;
use src\controllers\UserController;
use src\controllers\TournamentController;
use src\controllers\TournamentPlayerController;
use src\controllers\TournamentMatchesController;

//mert
use src\controllers\AuthController;
use src\middleware\AuthMiddleware;
use src\middleware\Require2FAMiddleware;

// pages
$this->router->get('/game', 'src/controllers/game.php');

// users
$this->router->get('/api/users', [UserController::class, 'getUsers']);
$this->router->get('/api/user/{id}', [UserController::class, 'getUser']);
$this->router->get('/api/user/{email}', [UserController::class, 'getUserByEmail']);
$this->router->get('/api/user/{userName}', [UserController::class, 'getUserByUsername']);
$this->router->post('/api/user/new', [UserController::class, 'newUser']);
$this->router->post('/api/user/login', [UserController::class, 'userLogin']);
$this->router->post('/api/user/logout', [UserController::class, 'logout']); //mert
$this->router->patch('/api/user/update', [UserController::class, 'updateUser']);
$this->router->patch('/api/user/changePassword', [UserController::class, 'changePassword']);
$this->router->delete('/api/user/{id}', [UserController::class, 'deleteUser']);

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


//mert

// 2FA authentication routes
$this->router->post('/api/auth/send-2fa', [AuthController::class, 'sendTwoFactorCode'], [AuthMiddleware::class]);
$this->router->post('/api/auth/verify-2fa', [AuthController::class, 'verifyTwoFactorCode'], [AuthMiddleware::class]);

// ===== MIDDLEWARE USAGE GUIDE FOR TEAMMATES =====
// 
// To protect your routes, add [Require2FAMiddleware::class] as third parameter:
// Example: $this->router->get('/api/users', [UserController::class, 'getUsers'], [Require2FAMiddleware::class]);
//
// This checks:
// - User has valid JWT token
// - User completed 2FA verification
//
// Routes that should be PROTECTED (add middleware):
// - Any route accessing user data (get users, get user by ID, update user, etc.)
// - Any route accessing matches/tournaments
// - Any route modifying data (POST, PATCH, DELETE)
//
// Routes that must stay PUBLIC (NO middleware):
// - /api/user/new (register) 
// - /api/user/login
//
// ⚠️ WARNING: Routes defined above are currently UNPROTECTED!
// ⚠️ Add [Require2FAMiddleware::class] to routes handling sensitive data.
