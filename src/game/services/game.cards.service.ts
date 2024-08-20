import { dealCards, shuffleDeck } from '@/src/game/utils/game.cards';
import { Injectable } from '@nestjs/common';
import { GameRepository } from '../repositories/game.repository';

@Injectable()
export class CardsService {
  constructor(private readonly gameRepository: GameRepository) {}

  async startCardDistribution(roomId: string): Promise<any[]> {
    try {
      const deck = shuffleDeck();

      const players =
        await this.gameRepository.findAllPlayersInRoomInDatabase(roomId);

      let playerCards = [];
      let deckWithoutPlayerCards = [];
      dealCards(deck, players, playerCards, deckWithoutPlayerCards);

      const updatePromises = playerCards.map(({ playerId, cards }) =>
        this.gameRepository.updatePlayerCardsInDatabase(playerId, cards),
      );

      await Promise.all(updatePromises);

      const updatedPlayers =
        await this.gameRepository.findAllPlayersInRoomInDatabase(roomId);

      return updatedPlayers;
    } catch (error) {
      console.error('Error in card distribution:', error);
      throw error;
    }
  }
}
