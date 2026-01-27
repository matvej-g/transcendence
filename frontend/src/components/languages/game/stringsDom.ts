import type { Lang } from "../i18n.js";

// keys for game DOM texts
export type GameDomKey =
  | "choose_game_mode"
  | "play_local"
  | "play_vs_player"
  | "play_tournament"
  | "exit_tournament"
  | "exit_game";

export type GameDomStringsTableT = Record<GameDomKey, string>;

export const GameDomStrings: Record<Lang, GameDomStringsTableT> = {
  en: {
    choose_game_mode: "Choose game mode",
    play_local: "Play Local",
    play_vs_player: "Play vs Player",
    play_tournament: "Play Tournament",
    exit_tournament: "Exit Tournament",
    exit_game: "Exit Game",
  },
  ru: {
    choose_game_mode: "Выбор режима игры",
    play_local: "Играть локально",
    play_vs_player: "Играть против игрока",
    play_tournament: "Играть турнир",
    exit_tournament: "Выйти из турнир",
    exit_game: "Выйти из игры",
  },
  de: {
	choose_game_mode: "Spielmodus wählen",
	play_local: "Lokal spielen",
	play_vs_player: "Gegen Spieler spielen",
  play_tournament: "Turnier spielen",
  exit_tournament: "Turnier verlassen",
	exit_game: "Spiel verlassen",
  },
} as const satisfies Record<Lang, GameDomStringsTableT>;