<?php

use src\controllers\MatchesController;
use src\controllers\UserController;
use src\controllers\TournamentController;
use src\controllers\TournamentPlayerController;
use src\controllers\TournamentMatchesController;
use src\controllers\MessagingController;
use src\controllers\FriendshipController;
use src\controllers\UserStatusController;

// pages 
$this->router->get('/game', 'src/controllers/game.php');

// users
$this->router->get('/api/users', [UserController::class, 'getUsers']);
$this->router->get('/api/user/{id}', [UserController::class, 'getUser']);
$this->router->get('/api/user/{id}/stats', [UserController::class, 'getUserStats']);
$this->router->get('/api/user/{email}', [UserController::class, 'getUserByEmail']);
$this->router->get('/api/user/{userName}', [UserController::class, 'getUserByUsername']);
$this->router->post('/api/user/new', [UserController::class, 'newUser']);
$this->router->post('/api/user/login', [UserController::class, 'userLogin']);
$this->router->post('/api/user/{id}/uploadAvatar', [UserController::class, 'uploadAvatar']);
$this->router->patch('/api/user/update', [UserController::class, 'updateUser']);
$this->router->patch('/api/user/changePassword', [UserController::class, 'changePassword']);
$this->router->delete('/api/user/{id}', [UserController::class, 'deleteUser']);
$this->router->delete('/api/user/{id}/avatar', [UserController::class, 'deleteAvatar']);

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
$this->router->post('/api/tournament/{id}/generate-matches', [TournamentController::class, 'generateMatches']);
$this->router->get('/api/tournament/{id}/next-match', [TournamentController::class, 'getNextMatch']);
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

// messaging
$this->router->get('/api/conversations', [MessagingController::class, 'getConversations']);
$this->router->get('/api/conversations/{id}', [MessagingController::class, 'getConversation']);
$this->router->post('/api/conversations', [MessagingController::class, 'createConversation']);
$this->router->post('/api/conversations/{id}/messages', [MessagingController::class, 'sendMessage']);
$this->router->patch('/api/messages/{id}', [MessagingController::class, 'editMessage']);

// friendships
$this->router->get('/api/friends', [FriendshipController::class, 'getFriends']);
$this->router->post('/api/friends/request', [FriendshipController::class, 'sendRequest']);
$this->router->patch('/api/friends/{id}', [FriendshipController::class, 'updateStatus']);

// user status
$this->router->get('/api/status/{id}', [UserStatusController::class, 'getStatus']);
$this->router->patch('/api/status/online', [UserStatusController::class, 'setOnline']);
$this->router->patch('/api/status/offline', [UserStatusController::class, 'setOffline']);
