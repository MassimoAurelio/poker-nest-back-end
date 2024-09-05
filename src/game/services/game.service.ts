import { PrismaService } from '@/prisma/prisma.service';
import { CommonUserRepository } from '@/src/common/bd/user.repository';
import { GameDto } from '@/src/game/dto/game.dto';
import { dealCards, shuffleDeck } from '@/src/game/utils/game.cards';
import { Injectable } from '@nestjs/common';
import { Hand } from 'pokersolver';
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

  async findWinner(roomId: string) {
    try {
      const players = await this.prisma.user.findMany({
        where: { roomId: roomId },
      });

      if (players.length === 0) {
        throw new Error('No players found in the room');
      }

      // makeTurn не удалять
      const activePlayers = players.filter(
        (player) => !player.fold && player.makeTurn,
      );

      // Определяем победителя если все скинули
      const lastWinner = activePlayers.filter((player) => !player.fold);

      if (lastWinner.length === 1) {
        let totalBets = 0;
        players.forEach((player) => {
          totalBets +=
            player.preFlopLastBet +
            player.flopLastBet +
            player.turnLastBet +
            player.riverLastBet;
        });

        const winner = lastWinner[0];
        await this.prisma.user.update({
          where: { id: winner.id },
          data: {
            stack: winner.stack + totalBets,
            winner: true,
          },
        });

        console.log(
          `Победитель ${JSON.stringify(winner.name)} после того как все скинули`,
        );

        return { winners: [winner.name], winnerSum: totalBets };
      }

      // Проверяем есть ли игроки, которые пошли в allIn
      const allInPlayers = activePlayers.filter((player) => player.allIn);

      if (allInPlayers.length > 0) {
        this.tableCards = [];
        if (this.tableCards.length === 0) {
          await this.handleDealFlop();
          await this.handleDealOneCard();
          await this.handleDealOneCard();
        }

        if (this.tableCards.length === 3) {
          await this.handleDealOneCard();
          await this.handleDealOneCard();
        }

        if (this.tableCards.length === 4) {
          await this.handleDealOneCard();
        }

        const communityCards = this.tableCards;

        const hands = activePlayers.map((player) => {
          if (Array.isArray(player.cards)) {
            const playerCards = player.cards.map((card) => {
              if (isCard(card)) {
                return `${card.value}${card.suit}`;
              } else {
                console.error('Некорректная карта игрока:', card);
                return '';
              }
            });

            const allCards = [
              ...playerCards,
              ...communityCards.map((card) => {
                if (isCard(card)) {
                  return `${card.value}${card.suit}`;
                } else {
                  console.error('Некорректная общая карта:', card);
                  return '';
                }
              }),
            ];

            return {
              player: player.name,
              hand: Hand.solve(allCards),
              totalBet:
                player.preFlopLastBet +
                player.flopLastBet +
                player.turnLastBet +
                player.riverLastBet,
            };
          } else {
            console.error('Player cards are not an array:', player.cards);
            return null;
          }
        });

        const winningHand = Hand.winners(hands.map((h) => h.hand));

        let totalBets = 0;
        players.forEach((player) => {
          totalBets +=
            player.preFlopLastBet +
            player.flopLastBet +
            player.turnLastBet +
            player.riverLastBet;
        });

        const winners = hands
          .filter((h) => winningHand.includes(h.hand))
          .map((h) => h.player);

        if (winners.length > 0) {
          const potSize = totalBets;
          const winningsPerWinner = potSize / winners.length;

          for (const winner of winners) {
            const winnerPlayer = await this.prisma.user.findUnique({
              where: { name: winner },
            });

            if (winnerPlayer) {
              await this.prisma.user.update({
                where: { id: winnerPlayer.id },
                data: {
                  stack: winnerPlayer.stack + winningsPerWinner,
                  winner: true,
                },
              });
            }
          }

          await this.prisma.user.updateMany({
            where: { stack: { lte: 0 } },
            data: { loser: true },
          });

          console.log('Победа allIn');
          return { winners, winnerSum: potSize };
        }
      }

      // Определение победителя после вскрытия карт
      if (activePlayers.length > 0) {
        const communityCards = this.tableCards;
        const hands = activePlayers.map((player) => {
          const playerCards = (
            player.cards as Array<{ value: string; suit: string }>
          ).map((card) => `${card.value}${card.suit}`);

          const allCards = [
            ...playerCards,
            ...communityCards.map((card) => `${card.value}${card.suit}`),
          ];

          return {
            player: player.name,
            hand: Hand.solve(allCards),
            totalBet:
              player.preFlopLastBet +
              player.flopLastBet +
              player.turnLastBet +
              player.riverLastBet,
          };
        });

        const winningHand = Hand.winners(hands.map((h) => h.hand));

        let totalBets = 0;
        players.forEach((player) => {
          totalBets +=
            player.preFlopLastBet +
            player.flopLastBet +
            player.turnLastBet +
            player.riverLastBet;
        });

        const winners = hands
          .filter((h) => winningHand.includes(h.hand))
          .map((h) => h.player);

        const potSize = totalBets;
        const winningsPerWinner = potSize / winners.length;

        for (const winner of winners) {
          const winnerPlayer = await this.prisma.user.findUnique({
            where: { name: winner },
          });

          if (winnerPlayer) {
            await this.prisma.user.update({
              where: { id: winnerPlayer.id },
              data: {
                stack: winnerPlayer.stack + winningsPerWinner,
                winner: true,
              },
            });
          }
        }

        await this.prisma.user.updateMany({
          where: { stack: { lte: 0 } },
          data: { loser: true },
        });

        console.log('Победа после вскрытия карт');
        return { winners, winnerSum: potSize };
      }
    } catch (error) {
      console.error(`Ошибка при определении победителя: ${error}`);
    }
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
