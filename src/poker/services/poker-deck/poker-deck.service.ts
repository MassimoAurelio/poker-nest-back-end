import { Injectable } from '@nestjs/common';

@Injectable()
export class PokerDeckService {
  private readonly suits = ['♠', '♣', '♦', '♥'];
  private readonly values = [
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '10',
    'J',
    'Q',
    'K',
    'A',
  ];

  /**
   * Функция для перемешивания колоды карт
   * @returns {Promise<Array>} Перемешанная колода карт
   */
  async shuffleDeck(): Promise<Array<{ value: string; suit: string }>> {
    const deck = [];
    this.suits.forEach((suit) => {
      this.values.forEach((value) => {
        deck.push({ value, suit });
      });
    });

    // Перемешивание колоды карт
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    return deck;
  }

  /**
   * Функция для раздачи карт игрокам
   * @param {Array} deck - Колода карт
   * @param {Array} players - Массив игроков
   * @param {Array} playerCards - Массив карт игроков
   * @param {Array} deckWithoutPlayerCards - Массив карт, оставшихся в колоде
   * @returns {Promise<Array>} Массив карт игроков
   */
  async dealCards(
    deck: Array<{ value: string; suit: string }>,
    players: Array<{ _id: string }>,
    playerCards: Array<{
      playerId: string;
      cards: Array<{ value: string; suit: string }>;
    }>,
    deckWithoutPlayerCards: Array<{ value: string; suit: string }>,
  ): Promise<
    Array<{ playerId: string; cards: Array<{ value: string; suit: string }> }>
  > {
    playerCards.length = 0;
    deckWithoutPlayerCards.length = 0;

    for (let i = 0; i < players.length; i++) {
      const cards = [deck.pop(), deck.pop()];
      playerCards.push({ playerId: players[i]._id, cards });
    }

    while (deck.length > 0) {
      deckWithoutPlayerCards.push(deck.pop());
    }

    return playerCards;
  }
}
