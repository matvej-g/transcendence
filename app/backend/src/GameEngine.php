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
                'velocity' => 0, // -1,0,1 
                'score' => 0
            ],
            'rightPaddle' => [
                'x' => self::CANVAS_WIDTH - 20 - self::PADDLE_WIDTH,
                'y' => (self::CANVAS_HEIGHT - self::PADDLE_HEIGHT) / 2,
                'width' => self::PADDLE_WIDTH,
                'height' => self::PADDLE_HEIGHT,
                'speed' => self::PADDLE_SPEED,
                'velocity' => 0, // -1,0,1
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

		$this->updatePaddles($deltaTime);
		$this->updateBall($deltaTime);
		$this->checkCollision();
		$this->checkScoring();
		return $this->gameState;
	}

	private function updatePaddles(float $deltaTime): void {
		foreach (['leftPaddle', 'rightPaddle'] as $paddleKey) {
			$velocity = $this->gameState[$paddleKey]['velocity'];

			if ($velocity != 0) {
				$movement = $this->gameState[$paddleKey]['speed'] * $deltaTime * $velocity;
				$this->gameState[$paddleKey]['y'] += $movement;

				$this->gameState[$paddleKey]['y'] = max(
					0,
					min(
						self::CANVAS_HEIGHT - $this->gameState[$paddleKey]['height'],
						$this->gameState[$paddleKey]['y']
					)
				);
			}
		}
	}

	private function updateBall(float $deltaTime): void {
		$ball = &$this->gameState['ball'];

		$ball['x'] += $ball['velocityX'] * $ball['speed'] * $deltaTime;
		$ball['y'] += $ball['velocityY'] * $ball['speed'] * $deltaTime;
	}

	public function setPaddleVelocity(string $paddle, int $velocity): void {
		$paddleKey = $paddle === 'left' ? 'leftPaddle' : 'rightPaddle';
		//clamp velocity to -1, 0, -1
		$this->gameState[$paddleKey]['velocity'] = max(-1, min(1, $velocity));
	}

	private function checkCollision(): void {
		$ball = &$this->gameState['ball'];
		//top/bottom wall
		if ($ball['y'] - $ball['radius'] <= 0) {
			$ball['y'] = $ball['radius'];
			$ball['velocityY'] *= -1;
		} else if ($ball['y'] + $ball['radius'] >= self::CANVAS_HEIGHT) {
			$ball['y'] = self::CANVAS_HEIGHT - $ball['radius'];
			$ball['velocityY'] *= -1;
		}
	}

	private function checkScoring(): void {
		$ball = $this->gameState['ball'];

		//leftside check (right player gets score)
		if ($ball['x'] - $ball['radius'] <= 0) {
			$this->gameState['rightPaddle']['score']++;
			$this->resetBall();
		}
		//right side check (left player scores)
		if ($ball['x'] + $ball['radius'] >= self::CANVAS_WIDTH) {
			$this->gameState['leftPaddle']['score']++;
			$this->resetBall();
		}
		//check for winner
		if ($this->gameState['leftPaddle']['score'] >= self::MAX_SCORE) {
			$this->gameState['winner'] = 'left';
			$this->gameState['isRunning'] = false;
		}
		if ($this->gameState['rightPaddle']['score'] >= self::MAX_SCORE) {
			$this->gameState['winner'] = 'right';
			$this->gameState['isRunning'] = false;
		}
	}

	private function resetBall(): void {
		$ball = &$this->gameState['ball'];
		$ball['x'] = self::CANVAS_WIDTH / 2;
		$ball['y'] = self::CANVAS_HEIGHT / 2;
		$ball['speed'] = self::BALL_INITIAL_SPEED;
		$ball['velocityX'] = (rand(0, 1) > 0.5 ? 1 : -1) * 5;
		$ball['velocityY'] = (rand(0, 1) > 0.5 ? 1 : -1) * 5;
	}
}