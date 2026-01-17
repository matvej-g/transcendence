<?php
namespace Pong;


class TournamentLogic {
	// Utility class: all methods are static

	public static function shufflePlayers(array $players): array {
		shuffle($players);
		$pairs = [];
		for ($i = 0; $i < count($players); $i += 2) {
			if (isset($players[$i + 1])) {
				$pairs[] = [$players[$i], $players[$i + 1]];
			} else {
				$pairs[] = [$players[$i]];
			}
		}
		return $pairs;
	}

	public static function getNextRoundPairs(array $players): array {
		$pairs = [];
		for ($i = 0; $i < count($players); $i += 2) {
			if (isset($players[$i + 1])) {
				$pairs[] = [$players[$i], $players[$i + 1]];
			} else {
				$pairs[] = [$players[$i]];
			}
		}
		return $pairs;
	}

	public static function getNumOfRounds(int $numPlayers): int {
		return (int) ceil(log($numPlayers, 2));
	}
}