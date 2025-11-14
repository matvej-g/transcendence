<?php

use src\controllers\MatchesController;
use src\controllers\UserController;

// pages
$this->router->get('/', 'src/controllers/home.php');
$this->router->get('/about', 'src/controllers/about.php');
$this->router->get('/contact', 'src/controllers/contact.php');
$this->router->get('/game', 'src/controllers/game.php');

// Database
// $this->router->post('/register', [UserController::class, 'register']);
$this->router->get('/api/users', [UserController::class, 'getUsers']);
$this->router->get('/api/user/{id}', [UserController::class, 'getUser']); // not working need proper handling of variable input
$this->router->post('/api/user/new', [UserController::class, 'newUser']); // change to post


// matches
$this->router->get('/api/matches', [MatchesController::class, 'getMatches']);
$this->router->get('/api/match/{id}', [MatchesController::class, 'getMatch']);
// should be post laster
$this->router->post('/api/match/new', [MatchesController::class, 'newMatch']);
// $router->group('/api/user', function($r){

// });
