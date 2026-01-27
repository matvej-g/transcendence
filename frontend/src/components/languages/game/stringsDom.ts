import type { Lang } from "../i18n.js";

// keys for game DOM texts
export type GameDomKey =
  | "choose_game_mode"
  | "play_local"
  | "play_vs_player"
  | "play_tournament"
  | "exit_tournament"
  | "exit_game"
  | "searching_for_players"
  | "wins"
  | "left"
  | "right";

export type GameDomStringsTableT = Record<GameDomKey, string>;

export const GameDomStrings: Record<Lang, GameDomStringsTableT> = {
  en: {
    choose_game_mode: "Choose game mode",
    play_local: "Play Local",
    play_vs_player: "Play vs Player",
    play_tournament: "Play Tournament",
    exit_tournament: "Exit Tournament",
    exit_game: "Exit Game",
	searching_for_players: "Searching for players...",
	wins: "WINS!",
	left: "Left",
	right: "Right",
  },
  ru: {
    choose_game_mode: "Выбор режима игры",
    play_local: "Играть локально",
    play_vs_player: "Играть против игрока",
    play_tournament: "Играть турнир",
    exit_tournament: "Выйти из турнира",
    exit_game: "Выйти из игры",
	searching_for_players: "Поиск игроков...",
	wins: "ВЫЙГРАЛ!",
	left: "Левый",
	right: "Правый",
  },
  de: {
	choose_game_mode: "Spielmodus wählen",
	play_local: "Lokal spielen",
	play_vs_player: "Gegen Spieler spielen",
  play_tournament: "Turnier spielen",
  exit_tournament: "Turnier verlassen",
	exit_game: "Spiel verlassen",
	searching_for_players: "Suche nach Spielern...",
	wins: "GEWINNT!",
	left: "Links",
	right: "Rechts",
  },
} as const satisfies Record<Lang, GameDomStringsTableT>;