export const suits = ['♠', '♣', '♦', '♥'];
export const values = [
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

export const shuffleDeck = (): { value: string; suit: string }[] => {
  const deck = [];
  suits.forEach((suit) => {
    values.forEach((value) => {
      deck.push({ value, suit });
    });
  });

  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  return deck;
};

export const dealCards = (
  deck: { value: string; suit: string }[],
  players: any[],
  playerCards: any[],
  deckWithoutPlayerCards: { value: string; suit: string }[],
): any[] => {
  playerCards.length = 0;
  deckWithoutPlayerCards.length = 0;

  for (let i = 0; i < players.length; i++) {
    const cards = [deck.pop(), deck.pop()];
    playerCards.push({ playerId: players[i].id, cards });
  }

  while (deck.length > 0) {
    deckWithoutPlayerCards.push(deck.pop());
  }

  return playerCards;
};
