import { Injectable } from '@nestjs/common';
interface Player {
  id: string;
  name: string;
  stack: number | null;
  position: number | null;
  roomId: string;
  isDealer: boolean;
  currentPlayerId: boolean;
  fold: boolean;
  lastBet: number;
  preFlopLastBet: number;
  flopLastBet: number;
}

interface GameState {
  players: Player[];
}

@Injectable()
export class GameStateService {
  private gameState: Map<string, GameState> = new Map();

  getState(roomId: string): GameState | undefined {
    return this.gameState.get(roomId);
  }

  updateState(roomId: string, newState: GameState): void {
    this.gameState.set(roomId, newState);
  }

  createState(roomId: string, initialState: GameState): void {
    if (!this.gameState.has(roomId)) {
      this.gameState.set(roomId, initialState);
    }
  }

  addPlayer(roomId: string, newPlayer: Player): void {
    const state = this.getState(roomId);

    if (!state) {
      console.error(`Game state for roomId ${roomId} does not exist.`);
      return;
    }

    state.players.push(newPlayer);
    this.updateState(roomId, state);
  }
}
