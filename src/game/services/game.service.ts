import { CommonUserRepository } from '@/src/common/bd/user.repository';
import { dealCards, shuffleDeck } from '@/src/game/utils/game.cards';
import { Injectable } from '@nestjs/common';
import { GameRepository } from '../repositories/game.repository';

@Injectable()
export class GameService {
  constructor(
    private readonly gameRepository: GameRepository,
    private readonly commonUserRepository: CommonUserRepository,
  ) {}

  async getActivePlayers(roomId: string) {
    const activePlayers =
      await this.commonUserRepository.findAllUsersInRoomInDatabase(roomId);
    return activePlayers;
  }

  async startNewRound(roomId: string) {
    await this.gameRepository.fullUpdateAllUsers(roomId);

    await this.gameRepository.setCurrentPlayer(roomId, 3);

    const sbPlayer = await this.gameRepository.setSb(roomId);

    if (sbPlayer && sbPlayer.stack < 0) {
      await this.gameRepository.setFoldInSbPlayer(roomId);
    }

    const bbPlayer = await this.gameRepository.setBb(roomId);
    if (bbPlayer && bbPlayer.stack < 0) {
      await this.gameRepository.setFoldInSbPlayer(roomId);
    }
    await this.startCardDistribution(roomId);
    const updatedPlayers =
      await this.commonUserRepository.findAllUsersInRoomInDatabase(roomId);

    return updatedPlayers;
  }

  async startCardDistribution(roomId: string): Promise<any[]> {
    try {
      const deck = shuffleDeck();

      const players =
        await this.commonUserRepository.findAllUsersInRoomInDatabase(roomId);

      let playerCards = [];
      let deckWithoutPlayerCards = [];
      dealCards(deck, players, playerCards, deckWithoutPlayerCards);

      const updatePromises = playerCards.map(({ playerId, cards }) =>
        this.gameRepository.updatePlayerCardsInDatabase(playerId, cards),
      );

      await Promise.all(updatePromises);

      const updatedPlayers =
        await this.commonUserRepository.findAllUsersInRoomInDatabase(roomId);

      return updatedPlayers;
    } catch (error) {
      console.error('Error in card distribution:', error);
      throw error;
    }
  }
}
