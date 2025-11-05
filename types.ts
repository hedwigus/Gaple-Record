
export enum GameStatus {
  SETUP = 'setup',
  PLAYING = 'playing',
  FINISHED = 'finished',
}

export interface Player {
  id: number;
  name: string;
}

export interface Round {
  scores: Record<number, number | ''>;
}

export interface Game {
  status: GameStatus;
  location: string;
  date: string;
  players: Player[];
  rounds: Round[];
}
