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

  addPlayerToRoom(roomId: string, player: Player) {
    if (!this.gameState.has(roomId)) {
      this.gameState.set(roomId, { players: [] });
    }
    const roomState = this.gameState.get(roomId)!;
    roomState.players.push(player);
  }

  getPlayerFromRoom(roomId: string, playerId: string): Player | undefined {
    const roomState = this.gameState.get(roomId);
    return roomState?.players.find((p) => p.id === playerId);
  }

  getPlayersInRoom(roomId: string): Player[] {
    return this.gameState.get(roomId)?.players || [];
  }
}
