<?php

namespace src\controllers;

use src\Database;
use src\http\Request;
use src\controllers\BaseController;
use src\Models\UserModel;
use src\Models\MatchesModel;
use src\Models\UserStatsModel;
use src\Validator;

class MatchesController extends BaseController
{
    private MatchesModel $matches;
    private UserModel $users;
    private UserStatsModel $stats;

    public function __construct(Database $db)
    {
        $this->matches = new MatchesModel($db);
        $this->users   = new UserModel($db);
        $this->stats   = new UserStatsModel($db);
    }

    public function getMatch(Request $request, $parameters)
    {
        $id = $parameters['id'] ?? null;
        if (!Validator::validateId($id)) {
            return $this->jsonBadRequest('Invalid match id');
        }
        $id = (int)$id;
        $match = $this->matches->getMatchById($id);
        if ($match === null) {
            return $this->jsonServerError();
        }
        if (!$match) {
            return $this->jsonNotFound('Match not found');
        }
        return $this->jsonSuccess($match);
    }

    public function getMatches(Request $request, $parameters)
    {
        $all = $this->matches->getAllMatches();
        if ($all === null) {
            return $this->jsonServerError();
        }
        return $this->jsonSuccess($all);
    }

    public function newMatch(Request $request, $parameters)
    {
        $playerOneId = $request->postParams['idPlayerOne'] ?? null;
        $playerTwoId = $request->postParams['idPlayerTwo'] ?? null;

        if (!Validator::validateId($playerOneId) || !Validator::validateId($playerTwoId)) {
            return $this->jsonBadRequest('Invalid user id');
        }

        $playerOneId = (int)$playerOneId;
        $playerTwoId = (int)$playerTwoId;

        if ($playerOneId === $playerTwoId) {
            return $this->jsonBadRequest('Players must be different');
        }

        $userOne = $this->users->getUserById($playerOneId);
        if ($userOne === null) {
            return $this->jsonServerError();
        }
        if (!$userOne) {
            return $this->jsonNotFound('User one not found');
        }

        $userTwo = $this->users->getUserById($playerTwoId);
        if ($userTwo === null) {
            return $this->jsonServerError();
        }
        if (!$userTwo) {
            return $this->jsonNotFound('User two not found');
        }

        $id = $this->matches->createMatch($playerOneId, $playerTwoId);
        if ($id === null) {
            return $this->jsonServerError();
        }
        return $this->jsonCreated(['id' => $id]);
    }

    public function updateScore(Request $request, $parameters)
    {
        $id = $parameters['id'] ?? null;
        if (!Validator::validateId($id)) {
            return $this->jsonBadRequest('Invalid match id');
        }

        $match = $this->matches->getMatchById((int)$id);
        if ($match === null) {
            return $this->jsonServerError();
        }
        if (!$match) {
            return $this->jsonNotFound('Match not found');
        }

        if ($match['finished_at'] !== null) {
            return $this->jsonBadRequest('Match already finished');
        }

        $scoreOne = $request->postParams['scorePlayerOne'] ?? null;
        $scoreTwo = $request->postParams['scorePlayerTwo'] ?? null;
        if ($scoreOne === null|| $scoreTwo === null || !ctype_digit($scoreOne) || !ctype_digit($scoreTwo)) {
            return $this->jsonBadRequest('Invalid score values');
        }

        $scoreOne = (int)$scoreOne;
        $scoreTwo = (int)$scoreTwo;
        if ($scoreOne < 0 || $scoreTwo < 0 || $scoreOne < $match['score_player_one'] || $scoreTwo < $match['score_player_two']) {
            return $this->jsonBadRequest('Scores must be non-negative and not decrease');
        }

        $updated = $this->matches->updateScore((int)$id, $scoreOne, $scoreTwo);
        if ($updated === null) {
            return $this->jsonServerError();
        }
        return $this->jsonSuccess($updated);
    }

    public function endMatch(Request $request, $parameters)
    {
        $id = $parameters['id'] ?? null;
        if (!Validator::validateId($id)) {
            return $this->jsonBadRequest('Invalid match id');
        }

        $match = $this->matches->getMatchById((int)$id);
        if ($match === null) {
            return $this->jsonServerError();
        }
        if (!$match) {
            return $this->jsonNotFound('Match not found');
        }

        if ($match['finished_at'] !== null) {
            return $this->jsonBadRequest('Match already finished');
        }

        $playerOneId = (int) $match['player_one_id'];
        $playerTwoId = (int) $match['player_two_id'];
        $scoreOne    = (int) $match['score_player_one'];
        $scoreTwo    = (int) $match['score_player_two'];

        $winnerId = 0;
        if ($scoreOne > $scoreTwo) {
            $winnerId = $playerOneId;
            $this->stats->recordMatchResult($playerOneId, $playerTwoId, $scoreOne, $scoreTwo);
        } elseif ($scoreOne < $scoreTwo) {
            $winnerId = $playerTwoId;
            $this->stats->recordMatchResult($playerTwoId, $playerOneId, $scoreTwo, $scoreOne);
        } else {
            // draw
            $this->stats->recordDraw($playerOneId, $playerTwoId, $scoreOne, $scoreTwo);
        }

        $finished = $this->matches->endMatch((int)$id, $winnerId);
        if ($finished === null) {
            return $this->jsonServerError();
        }
        return $this->jsonSuccess($finished);
    }

    public function deleteMatch(Request $request, $parameters)
    {
        $id = $parameters['id'] ?? null;
        if (!Validator::validateId($id)) {
            return $this->jsonBadRequest('Invalid match id');
        }
        $deleted = $this->matches->deleteMatch((int)$id);
        if ($deleted === null) {
            return $this->jsonServerError();
        }
        if ($deleted === 0) {
            return $this->jsonNotFound('Match not found');
        }
        return $this->jsonSuccess(['message' => 'Match deleted successfully']);
    }
}
