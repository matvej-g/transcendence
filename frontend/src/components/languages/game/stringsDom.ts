import type { Lang } from "../i18n.js";

// keys for game DOM texts
export type GameDomKey =
  | "choose_game_mode"
  | "play_local"
  | "play_vs_player"
  | "join_tournament"
  | "host_tournament"
  | "exit_game";

export type GameDomStringsTableT = Record<GameDomKey, string>;

export const GameDomStrings: Record<Lang, GameDomStringsTableT> = {
  en: {
    choose_game_mode: "Choose game mode",
    play_local: "Play Local",
    play_vs_player: "Play vs Player",
    join_tournament: "Join Tournament",
    host_tournament: "Host Tournament",
    exit_game: "Exit game",
  },
  ru: {
    choose_game_mode: "Выбор режима игры",
    play_local: "Играть локально",
    play_vs_player: "Играть против игрока",
    join_tournament: "Присоединиться к турниру",
    host_tournament: "Создать турнир",
    exit_game: "Выйти из игры",
  },
  de: {
	choose_game_mode: "Spielmodus wählen",
	play_local: "Lokal spielen",
	play_vs_player: "Gegen Spieler spielen",
  join_tournament: "Turnier beitreten",
  host_tournament: "Turnier erstellen",
	exit_game: "Spiel verlassen",
  },
} as const satisfies Record<Lang, GameDomStringsTableT>;