<?php
namespace App;

class GameEngine {
	private string $gameID;
	private array $gameState;
	private float $lastUpdate;

	private const CANVAS_WIDTH = 1400;
	private const CANVAS_HEIGHT = 700;
	private const PADDLE_WIDTH = 15;
	private const PADDLE_HEIGHT = 100;
	private const PADDLE_SPEED = 550;
	private const BALL_RADIUS = 10;
	private const BALL_INITIAL_SPEED = 60;
	private const BALL_MAX_SPEED = 300;
	private const MAX_SCORE = 5;

	public function __construct(string $gameID) {
		$this->gameID = $gameID;
		$this->lastUpdate = microtime(true);
		$this->gameState = $this->initializeGameState();
	}

	private function initializeGameState(): array {
        return [
            'leftPaddle' => [
                'x' => 20,
                'y' => (self::CANVAS_HEIGHT - self::PADDLE_HEIGHT) / 2,
                'width' => self::PADDLE_WIDTH,
                'height' => self::PADDLE_HEIGHT,
                'speed' => self::PADDLE_SPEED,
                'score' => 0
            ],
            'rightPaddle' => [
                'x' => self::CANVAS_WIDTH - 20 - self::PADDLE_WIDTH,
                'y' => (self::CANVAS_HEIGHT - self::PADDLE_HEIGHT) / 2,
                'width' => self::PADDLE_WIDTH,
                'height' => self::PADDLE_HEIGHT,
                'speed' => self::PADDLE_SPEED,
                'score' => 0
            ],
            'ball' => [
                'x' => self::CANVAS_WIDTH / 2,
                'y' => self::CANVAS_HEIGHT / 2,
                'radius' => self::BALL_RADIUS,
                'velocityX' => (rand(0, 1) > 0.5 ? 1 : -1) * 5,
                'velocityY' => (rand(0, 1) > 0.5 ? 1 : -1) * 5,
                'speed' => self::BALL_INITIAL_SPEED
            ],
            'isRunning' => true,
            'winner' => null
        ];
    }

	public function update(): array {
		if (!$this->gameState['isRunning']) {
			return $this->gameState;
		}
		$currentTime = microtime(true);
		$deltaTime = $currentTime - $this->lastUpdate;
		$this->lastUpdate = $currentTime;

		//update ball pos
		//check collisions
		//check score
		return $this->gameState;
	}


	public function movePaddle(string $paddle, string $direction, float $deltaTime): void {
        $paddleKey = $paddle === 'left' ? 'leftPaddle' : 'rightPaddle';
        $movement = $this->gameState[$paddleKey]['speed'] * $deltaTime;

        if ($direction === 'up') {
            $this->gameState[$paddleKey]['y'] = max(
                0, 
                $this->gameState[$paddleKey]['y'] - $movement
            );
        } elseif ($direction === 'down') {
            $maxY = self::CANVAS_HEIGHT - $this->gameState[$paddleKey]['height'];
            $this->gameState[$paddleKey]['y'] = min(
                $maxY,
                $this->gameState[$paddleKey]['y'] + $movement
            );
        }
    }



}