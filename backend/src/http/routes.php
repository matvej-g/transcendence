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
use src\controllers\OAuthController;
use src\middleware\AuthMiddleware;
use src\middleware\Require2FAMiddleware;


// users (public: registration & login)
$this->router->post('/api/user/new', [UserController::class, 'newUser']);
$this->router->post('/api/user/verify-registration', [UserController::class, 'verifyRegistration']);
$this->router->post('/api/user/resend-registration-code', [UserController::class, 'resendRegistrationCode']);
$this->router->post('/api/user/login', [UserController::class, 'userLogin']);

// Authenticated-only: logout (JWT required, 2FA not strictly needed)
$this->router->post('/api/user/logout', [UserController::class, 'logout'], [AuthMiddleware::class]); //mert
$this->router->get('/api/me', [UserController::class, 'getMe'], [AuthMiddleware::class]);

// users (protected)
// $this->router->get('/api/users', [UserController::class, 'getUsers'], [Require2FAMiddleware::class]);
$this->router->get('/api/user/{id}', [UserController::class, 'getUser'], [Require2FAMiddleware::class]);
$this->router->get('/api/user/{id}/stats', [UserController::class, 'getUserStats'], [Require2FAMiddleware::class]);
$this->router->get('/api/user/{email}', [UserController::class, 'getUserByEmail'], [Require2FAMiddleware::class]);
$this->router->get('/api/user/{userName}', [UserController::class, 'getUserByUsername'], [Require2FAMiddleware::class]);
$this->router->post('/api/user/{id}/uploadAvatar', [UserController::class, 'uploadAvatar'], [Require2FAMiddleware::class]);
$this->router->patch('/api/user/update', [UserController::class, 'updateUser'], [Require2FAMiddleware::class]);
$this->router->patch('/api/user/changePassword', [UserController::class, 'changePassword'], [Require2FAMiddleware::class]);
$this->router->patch('/api/user/changeEmail', [UserController::class, 'changeEmail'], [Require2FAMiddleware::class]);
$this->router->delete('/api/user/{id}', [UserController::class, 'deleteUser'], [Require2FAMiddleware::class]);
$this->router->delete('/api/user/{id}/avatar', [UserController::class, 'deleteAvatar'], [Require2FAMiddleware::class]);

// public profile (no auth / 2FA required, but block-aware)
$this->router->get('/api/public/profile/{id}', [UserController::class, 'getPublicProfile']);

// matches (protected)
$this->router->get('/api/matches', [MatchesController::class, 'getMatches'], [Require2FAMiddleware::class]);
$this->router->get('/api/match/{id}', [MatchesController::class, 'getMatch'], [Require2FAMiddleware::class]);
$this->router->post('/api/match/new', [MatchesController::class, 'newMatch'], [Require2FAMiddleware::class]);
$this->router->patch('/api/match/{id}/end', [MatchesController::class, 'endMatch'], [Require2FAMiddleware::class]);
$this->router->patch('/api/match/{id}', [MatchesController::class, 'updateScore'], [Require2FAMiddleware::class]);
$this->router->delete('/api/match/{id}', [MatchesController::class, 'deleteMatch'], [Require2FAMiddleware::class]);

// OAuth routes (public)
$this->router->get('/api/auth/google', [OAuthController::class, 'redirectToGoogle']);
$this->router->get('/api/auth/google/callback', [OAuthController::class, 'handleGoogleCallback']);

// 2FA authentication routes
$this->router->post('/api/auth/send-2fa', [AuthController::class, 'sendTwoFactorCode'], [AuthMiddleware::class]);
$this->router->post('/api/auth/verify-2fa', [AuthController::class, 'verifyTwoFactorCode'], [AuthMiddleware::class]);
$this->router->post('/api/auth/2fa/enable', [AuthController::class, 'enable2FA'], [AuthMiddleware::class]);
$this->router->post('/api/auth/2fa/disable', [AuthController::class, 'disable2FA'], [AuthMiddleware::class]);
$this->router->get('/api/auth/2fa/status', [AuthController::class, 'get2FAStatus'], [AuthMiddleware::class]);
$this->router->post('/api/auth/2fa/phone', [AuthController::class, 'setPhoneNumber'], [AuthMiddleware::class]);
$this->router->post('/api/auth/2fa/method', [AuthController::class, 'setTwoFactorMethod'], [AuthMiddleware::class]);
$this->router->get('/api/auth/2fa/method', [AuthController::class, 'getTwoFactorMethod'], [AuthMiddleware::class]);
$this->router->post('/api/auth/2fa/totp/setup', [AuthController::class, 'setupTotp'], [AuthMiddleware::class]);
$this->router->post('/api/auth/2fa/totp/confirm', [AuthController::class, 'confirmTotp'], [AuthMiddleware::class]);

// messaging (protected)
$this->router->get('/api/conversations', [MessagingController::class, 'getConversations'], [Require2FAMiddleware::class]);
$this->router->get('/api/conversations/{id}', [MessagingController::class, 'getConversation'], [Require2FAMiddleware::class]);
$this->router->post('/api/conversations', [MessagingController::class, 'createConversation'], [Require2FAMiddleware::class]);
$this->router->post('/api/conversations/{id}/messages', [MessagingController::class, 'sendMessage'], [Require2FAMiddleware::class]);
$this->router->patch('/api/messages/{id}', [MessagingController::class, 'editMessage'], [Require2FAMiddleware::class]);

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
