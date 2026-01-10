<?php

use src\controllers\MatchesController;
use src\controllers\UserController;
use src\controllers\TournamentController;
use src\controllers\TournamentPlayerController;
use src\controllers\TournamentMatchesController;
use src\controllers\MessagingController;
use src\controllers\FriendshipController;
use src\controllers\UserStatusController;

//mert
use src\controllers\AuthController;
use src\middleware\AuthMiddleware;
use src\middleware\Require2FAMiddleware;

// pages
$this->router->get('/game', 'src/controllers/game.php');

// users (public: registration & login)
$this->router->post('/api/user/new', [UserController::class, 'newUser']);
$this->router->post('/api/user/verify-registration', [UserController::class, 'verifyRegistration']);
$this->router->post('/api/user/login', [UserController::class, 'userLogin']);

// Authenticated-only: logout (JWT required, 2FA not strictly needed)
$this->router->post('/api/user/logout', [UserController::class, 'logout'], [AuthMiddleware::class]); //mert

// users (protected)
$this->router->get('/api/users', [UserController::class, 'getUsers'], /* [Require2FAMiddleware::class] */);
$this->router->get('/api/user/{id}', [UserController::class, 'getUser'], [Require2FAMiddleware::class]);
$this->router->get('/api/user/{id}/stats', [UserController::class, 'getUserStats'], [Require2FAMiddleware::class]);
$this->router->get('/api/user/{email}', [UserController::class, 'getUserByEmail'], [Require2FAMiddleware::class]);
$this->router->get('/api/user/{userName}', [UserController::class, 'getUserByUsername'], [Require2FAMiddleware::class]);
$this->router->post('/api/user/{id}/uploadAvatar', [UserController::class, 'uploadAvatar'], [Require2FAMiddleware::class]);
$this->router->patch('/api/user/update', [UserController::class, 'updateUser'], [Require2FAMiddleware::class]);
$this->router->patch('/api/user/changePassword', [UserController::class, 'changePassword'], [Require2FAMiddleware::class]);
$this->router->patch('/api/user/changeEmail', [UserController::class, 'changeEmail']);
$this->router->delete('/api/user/{id}', [UserController::class, 'deleteUser'], [Require2FAMiddleware::class]);
$this->router->delete('/api/user/{id}/avatar', [UserController::class, 'deleteAvatar'], [Require2FAMiddleware::class]);

// matches (protected)
$this->router->get('/api/matches', [MatchesController::class, 'getMatches'], [Require2FAMiddleware::class]);
$this->router->get('/api/match/{id}', [MatchesController::class, 'getMatch'], [Require2FAMiddleware::class]);
$this->router->post('/api/match/new', [MatchesController::class, 'newMatch'], [Require2FAMiddleware::class]);
$this->router->patch('/api/match/{id}/end', [MatchesController::class, 'endMatch'], [Require2FAMiddleware::class]);
$this->router->patch('/api/match/{id}', [MatchesController::class, 'updateScore'], [Require2FAMiddleware::class]);
$this->router->delete('/api/match/{id}', [MatchesController::class, 'deleteMatch'], [Require2FAMiddleware::class]);

// tournaments (protected)
$this->router->get('/api/tournaments', [TournamentController::class, 'getTournaments'], [Require2FAMiddleware::class]);
$this->router->get('/api/tournament/{id}', [TournamentController::class, 'getTournament'], [Require2FAMiddleware::class]);
$this->router->get('/api/tournament/{name}', [TournamentController::class, 'getTournamentByName'], [Require2FAMiddleware::class]);
$this->router->post('/api/tournament/new', [TournamentController::class, 'newTournament'], [Require2FAMiddleware::class]);
$this->router->patch('/api/tournament/{id}', [TournamentController::class, 'endTournament'], [Require2FAMiddleware::class]);
$this->router->post('/api/tournament/{id}/generate-matches', [TournamentController::class, 'generateMatches'], [Require2FAMiddleware::class]);
$this->router->get('/api/tournament/{id}/next-match', [TournamentController::class, 'getNextMatch'], [Require2FAMiddleware::class]);
$this->router->delete('/api/tournament/{id}', [TournamentController::class, 'deleteTournament'], [Require2FAMiddleware::class]);

// tournament players (protected)
$this->router->get('/api/tournament/{id}/players', [TournamentPlayerController::class, 'getTournamentPlayers'], [Require2FAMiddleware::class]);
$this->router->post('/api/tournament/{id}/player', [TournamentPlayerController::class, 'newTournamentPlayer'], [Require2FAMiddleware::class]);
$this->router->patch('/api/tournament/player/{id}', [TournamentPlayerController::class, 'updateTournamentPlayer'], [Require2FAMiddleware::class]);
$this->router->delete('/api/tournament/player/{id}', [TournamentPlayerController::class, 'deleteTournamentPlayer'], [Require2FAMiddleware::class]);

// tournament matches (protected)
$this->router->get('/api/tournament/matches', [TournamentMatchesController::class, 'getTournamentMatches'], [Require2FAMiddleware::class]);
$this->router->get('/api/tournament/match/{id}', [TournamentMatchesController::class, 'getTournamentMatch'], [Require2FAMiddleware::class]);
$this->router->post('/api/tournament/match/new', [TournamentMatchesController::class, 'newTournamentMatch'], [Require2FAMiddleware::class]);
$this->router->patch('/api/tournament/match/{id}', [TournamentMatchesController::class, 'updateTournamentMatch'], [Require2FAMiddleware::class]);
$this->router->delete('/api/tournament/match/{id}', [TournamentMatchesController::class, 'deleteTournamentMatch'], [Require2FAMiddleware::class]);

// 2FA authentication routes
$this->router->post('/api/auth/send-2fa', [AuthController::class, 'sendTwoFactorCode'], [AuthMiddleware::class]);
$this->router->post('/api/auth/verify-2fa', [AuthController::class, 'verifyTwoFactorCode'], [AuthMiddleware::class]);
$this->router->post('/api/auth/2fa/enable', [AuthController::class, 'enable2FA'], [AuthMiddleware::class]);
$this->router->post('/api/auth/2fa/disable', [AuthController::class, 'disable2FA'], [AuthMiddleware::class]);
$this->router->get('/api/auth/2fa/status', [AuthController::class, 'get2FAStatus'], [AuthMiddleware::class]);

// messaging (protected)
$this->router->get('/api/conversations', [MessagingController::class, 'getConversations'], /* [Require2FAMiddleware::class] */);
$this->router->get('/api/conversations/{id}', [MessagingController::class, 'getConversation'], /* [Require2FAMiddleware::class] */);
$this->router->post('/api/conversations', [MessagingController::class, 'createConversation'], /* [Require2FAMiddleware::class] */);
$this->router->post('/api/conversations/{id}/messages', [MessagingController::class, 'sendMessage'], /* [Require2FAMiddleware::class] */);
$this->router->patch('/api/messages/{id}', [MessagingController::class, 'editMessage'], /* [Require2FAMiddleware::class] */);

// friendships & blocks (protected)
$this->router->get('/api/friends', [FriendshipController::class, 'getFriends'], [Require2FAMiddleware::class]);
$this->router->post('/api/friends/request', [FriendshipController::class, 'sendRequest'], [Require2FAMiddleware::class]);
$this->router->post('/api/friends/decline', [FriendshipController::class, 'declineRequest'], [Require2FAMiddleware::class]);
$this->router->patch('/api/friends/{id}', [FriendshipController::class, 'updateStatus'], [Require2FAMiddleware::class]);
$this->router->get('/api/blocks', [FriendshipController::class, 'getBlocks'], [Require2FAMiddleware::class]);
$this->router->post('/api/friends/block', [FriendshipController::class, 'blockUser'], [Require2FAMiddleware::class]);
$this->router->post('/api/friends/unblock', [FriendshipController::class, 'unblockUser'], [Require2FAMiddleware::class]);

// user status (protected)
$this->router->get('/api/status/{id}', [UserStatusController::class, 'getStatus'], [Require2FAMiddleware::class]);
$this->router->patch('/api/status/online', [UserStatusController::class, 'setOnline'], [Require2FAMiddleware::class]);
$this->router->patch('/api/status/offline', [UserStatusController::class, 'setOffline'], [Require2FAMiddleware::class]);



//mert
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
// messaging
