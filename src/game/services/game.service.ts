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

  private tableCards = [];
  private deckWithoutPlayerCards = [];
  private playerCards = [];
  private roomStates = {};
  private gameState = {
    shouldDealFlop: false,
    shouldDealTurn: false,
    shouldDealRiver: false,
    updatePosition: false,
  };

  async dealFlopCards(roomId: string): Promise<any> {
    if (this.tableCards.length >= 3) {
      throw new Error('tableCards>= 3');
    }

    await this.commonUserRepository.refreshCurrentPlayerIdToFalseAllUsersInRoom(
      roomId,
    );

    const players =
      await this.commonUserRepository.findAllPlayersWhoDontMakeFold(roomId);
    await this.clearTable();
    await this.handleDealFlop();
    const lastCurrentPlayer = players.find(
      (player) => player.currentPlayerId === true,
    );

    if (lastCurrentPlayer) {
      await this.commonUserRepository.removeCurrentPlayer(
        lastCurrentPlayer.name,
      );
    }

    const bbPlayer = await this.commonUserRepository.findBbPlayer(roomId);
    await this.commonUserRepository.refreshLastBetInAllUsersInRoom(roomId);

    if (!bbPlayer) {
      throw new Error('The player on the big blind has not been found');
    }

    const minPlayer = players.reduce((minPlayer, currentPlayer) => {
      return currentPlayer.position < minPlayer.position
        ? currentPlayer
        : minPlayer;
    }, players[0]);

    await this.commonUserRepository.setCurrentPlayerByName(minPlayer.name);

    await this.gameRepository.updateAllInRoomToMakeTurnFalseAndRoundStageToFlop(
      roomId,
    );

    return this.tableCards;
  }

  async clearTable() {
    this.tableCards.length = 0;
  }

  async handleDealFlop(): Promise<void> {
    if (this.deckWithoutPlayerCards.length < 3) {
      throw new Error('Not enough cards in the deck to deal the flop');
    }
    const flopCards = this.deckWithoutPlayerCards.splice(0, 3);
    this.tableCards.push(...flopCards);
  }

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

      this.deckWithoutPlayerCards = [];
      this.playerCards = [];
      dealCards(deck, players, this.playerCards, this.deckWithoutPlayerCards);

      const updatePromises = this.playerCards.map(({ playerId, cards }) =>
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
