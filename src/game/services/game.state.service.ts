import { Injectable } from '@nestjs/common';
import { GameDto } from '../dto/game.dto';
interface GameState {
  gameId: string;
  players: string[];
  tableCards: string[];
  currentRound: string;
  // Другие свойства состояния игры
}
@Injectable()
export class GameStateService {
  private gameStates: Map<string, GameState> = new Map();

  getGameState(gameId: string): GameState | undefined {
    return this.gameStates.get(gameId);
  }

  setGameState(gameId: string, state: GameState): void {
    this.gameStates.set(gameId, state);
  }

  initializeGame(gameDto: GameDto): void {
    // Инициализация состояния игры
    const initialState: GameState = {
      gameId: gameDto.roomId,
      players: [],
      tableCards: [],
      currentRound: 'preflop', // например
    };
    this.gameStates.set(gameDto.roomId, initialState);
  }

  updateState(gameId: string, update: Partial<GameState>): void {
    const currentState = this.getGameState(gameId);
    if (currentState) {
      this.gameStates.set(gameId, { ...currentState, ...update });
    }
  }
}
