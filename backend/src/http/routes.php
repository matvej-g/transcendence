<?php

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
$this->router->post('/verify-2fa', [AuthController::class, 'verifyTwoFactorCode']);