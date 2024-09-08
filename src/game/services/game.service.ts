import { PrismaService } from '@/prisma/prisma.service';
import { CommonUserRepository } from '@/src/common/bd/user.repository';
import { GameDto } from '@/src/game/dto/game.dto';
import { dealCards, shuffleDeck } from '@/src/game/utils/game.cards';
import { Injectable } from '@nestjs/common';
import { GameRepository } from '../repositories/game.repository';

type Card = {
  value: string;
  suit: string;
};

function isCard(card: any): card is Card {
  return (
    card &&
    typeof card === 'object' &&
    typeof card.value === 'string' &&
    typeof card.suit === 'string'
  );
}

@Injectable()
export class GameService {
  constructor(
    private readonly gameRepository: GameRepository,
    private readonly commonUserRepository: CommonUserRepository,
    private readonly prisma: PrismaService,
  ) {}

  private tableCards = [];
  private deckWithoutPlayerCards = [];
  private playerCards = [];
  private roomStates = {};
  private gameState: {
    shouldDealFlop: boolean;
    shouldDealTurn: boolean;
    shouldDealRiver: boolean;
    updatePosition: boolean;
  } = {
    shouldDealFlop: false,
    shouldDealTurn: false,
    shouldDealRiver: false,
    updatePosition: false,
  };

  async findWinner(gameDto: GameDto) {
    const { roomId } = gameDto;

    const allPlayers =
      await this.commonUserRepository.findAllUsersInRoom(roomId);

    const activePlayers =
      await this.commonUserRepository.findAllNonFoldPlayers(roomId);
    let totalBets = 0;
    if (activePlayers.length === 1) {
      allPlayers.forEach((player) => {
        totalBets +=
          player.preFlopLastBet +
          player.flopLastBet +
          player.turnLastBet +
          player.riverLastBet;
      });
    }
    const winner = activePlayers[0];
    await this.prisma.user.update({
      where: { id: winner.id },
      data: {
        stack: winner.stack + totalBets,
        winner: true,
      },
    });
    return { winner, winnerSum: totalBets };
  }

  async dealFlopCards(gameDto: GameDto): Promise<any> {
    const { roomId } = gameDto;
    if (this.tableCards.length >= 3) {
      throw new Error('tableCards>= 3');
    }

    await this.commonUserRepository.resetCurrentPlayerIdInRoom(roomId);

    const players =
      await this.commonUserRepository.findAllNonFoldPlayers(roomId);
    await this.handleDealFlop();
    const lastCurrentPlayer = players.find(
      (player) => player.currentPlayerId === true,
    );

    if (lastCurrentPlayer) {
      await this.commonUserRepository.setCurrentPlayerByName(
        lastCurrentPlayer.name,
        false,
      );
    }

    const bbPlayer = await this.commonUserRepository.findPlayerByPosition(
      roomId,
      2,
    );
    await this.commonUserRepository.resetLastBetInRoom(roomId);

    if (!bbPlayer) {
      throw new Error('The player on the big blind has not been found');
    }

    const minPlayer = players.reduce((minPlayer, currentPlayer) => {
      return currentPlayer.position < minPlayer.position
        ? currentPlayer
        : minPlayer;
    }, players[0]);

    await this.commonUserRepository.setCurrentPlayerByName(
      minPlayer.name,
      true,
    );

    await this.gameRepository.updateAllInRoomToMakeTurnFalseAndRoundStageToFlop(
      roomId,
    );
    const updatedUsers =
      await this.commonUserRepository.findAllUsersInRoom(roomId);

    return { tableCards: this.tableCards, updatedUsers: updatedUsers };
  }
  //////
  async dealTurnCard(gameDto: GameDto): Promise<any> {
    const { roomId } = gameDto;
    if (this.tableCards.length >= 4) {
      throw new Error('tableCards>= 4');
    }

    const players =
      await this.commonUserRepository.findAllNonFoldPlayers(roomId);
    await this.handleDealOneCard();

    await this.commonUserRepository.resetLastBetInRoom(roomId);

    const minPlayer = players.reduce((minPlayer, currentPlayer) => {
      return currentPlayer.position < minPlayer.position
        ? currentPlayer
        : minPlayer;
    }, players[0]);

    const lastCurrentPlayer = players.find(
      (player) => player.currentPlayerId === true,
    );

    if (lastCurrentPlayer) {
      await this.commonUserRepository.setCurrentPlayerByName(
        lastCurrentPlayer.name,
        false,
      );
    }

    await this.commonUserRepository.setCurrentPlayerByName(
      minPlayer.name,
      true,
    );

    await this.gameRepository.updateAllInRoomToMakeTurnFalseAndRoundStageToTurn(
      roomId,
    );
    return this.tableCards;
  }

  async dealRiverCards(gameDto: GameDto): Promise<any> {
    const { roomId } = gameDto;
    if (this.tableCards.length >= 5) {
      throw new Error('tableCards>= 5');
    }
    const players =
      await this.commonUserRepository.findAllNonFoldPlayers(roomId);
    await this.handleDealOneCard();
    await this.commonUserRepository.resetLastBetInRoom(roomId);
    const minPlayer = players.reduce((minPlayer, currentPlayer) =>
      currentPlayer.position < minPlayer.position ? currentPlayer : minPlayer,
    );

    const lastCurrentPlayer = players.find((player) => player.currentPlayerId);
    if (lastCurrentPlayer) {
      await this.commonUserRepository.setCurrentPlayerByName(
        lastCurrentPlayer.name,
        false,
      );
    }
    await this.commonUserRepository.setCurrentPlayerByName(
      minPlayer.name,
      true,
    );

    await this.gameRepository.updateAllInRoomToMakeTurnFalseAndRoundStageToRiver(
      roomId,
    );

    return this.tableCards;
  }

  ////
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

  async handleDealOneCard(): Promise<void> {
    const flopCards = this.deckWithoutPlayerCards.splice(0, 1);
    this.tableCards.push(...flopCards);
  }

  async getActivePlayers(gameDto: GameDto) {
    const { roomId } = gameDto;
    const activePlayers =
      await this.commonUserRepository.findAllUsersInRoom(roomId);
    return activePlayers;
  }

  async startNewRound(gameDto: GameDto) {
    const { roomId } = gameDto;
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
    await this.startCardDistribution(gameDto);
    const updatedPlayers =
      await this.commonUserRepository.findAllUsersInRoom(roomId);

    return updatedPlayers;
  }

  async startCardDistribution(gameDto: GameDto): Promise<any[]> {
    const { roomId } = gameDto;
    try {
      const deck = shuffleDeck();

      const players =
        await this.commonUserRepository.findAllUsersInRoom(roomId);

      this.deckWithoutPlayerCards = [];
      this.playerCards = [];
      dealCards(deck, players, this.playerCards, this.deckWithoutPlayerCards);

      const updatePromises = this.playerCards.map(({ playerId, cards }) =>
        this.gameRepository.updatePlayerCardsInDatabase(playerId, cards),
      );

      await Promise.all(updatePromises);

      const updatedPlayers =
        await this.commonUserRepository.findAllUsersInRoom(roomId);

      return updatedPlayers;
    } catch (error) {
      console.error('Error in card distribution:', error);
      throw error;
    }
  }
}
