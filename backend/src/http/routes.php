<?php

use src\controllers\UserController;

// pages
$this->router->get('/', 'src/controllers/home.php');
$this->router->get('/about', 'src/controllers/about.php');
$this->router->get('/contact', 'src/controllers/contact.php');

// Database
// $this->router->post('/register', [UserController::class, 'register']);
$this->router->get('/users', [UserController::class, 'showUsers']);
