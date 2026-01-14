import type { Lang } from "../i18n.js";

// keys for game DOM texts
export type GameDomKey =
  | "choose_game_mode"
  | "play_local"
  | "play_vs_player"
  | "exit_game";

export type GameDomStringsTableT = Record<GameDomKey, string>;

export const GameDomStrings: Record<Lang, GameDomStringsTableT> = {
  en: {
    choose_game_mode: "Choose game mode",
    play_local: "Play locally",
    play_vs_player: "Play vs player",
    exit_game: "Exit game",
  },
  ru: {
    choose_game_mode: "Выбор режима игры",
    play_local: "Играть локально",
    play_vs_player: "Играть против игрока",
    exit_game: "Выйти из игры",
  },
  de: {
	choose_game_mode: "Spielmodus wählen",
	play_local: "Lokal spielen",
	play_vs_player: "Gegen Spieler spielen",
	exit_game: "Spiel verlassen",
  },
} as const satisfies Record<Lang, GameDomStringsTableT>;