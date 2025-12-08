<?php

use src\controllers\MatchesController;
use src\controllers\TournamentController;
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

// Test route - issue JWT (remove in production)
$this->router->get('/issue-jwt', 'src/controllers/issueJWT.php');

$this->router->get('/game', 'src/controllers/game.php');

// Public user routes - no auth required
$this->router->post('/api/user/new', [UserController::class, 'newUser']);
$this->router->post('/api/user/login', [UserController::class, 'userLogin']);

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

