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
$this->router->get('/api/users/register', [UserController::class, 'registerUser']); // change to post


// matches
$this->router->get('/api/matches', [MatchesController::class, 'getAllMatches']);
$this->router->get('/api/match/{id}', [MatchesController::class, 'getMatch']);
// should be post laster
$this->router->get('/api/match/new', [MatchesController::class, 'newMatch']);
// $router->group('/api/user', function($r){

// });
