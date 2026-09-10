// src/utils/initialBoard.js
// Utility to create the standard starting board state.
export const createInitialBoard = () => {
  const board = Array.from({ length: 8 }, () => Array(8).fill(null));

  const backRank = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];

  // Black pieces (indices 0 and 1 correspond to Ranks 8 and 7)
  for (let col = 0; col < 8; col++) {
    board[0][col] = { type: backRank[col], color: 'black', hasMoved: false };
    board[1][col] = { type: 'pawn', color: 'black', hasMoved: false };
  }

  // White pieces (indices 6 and 7 correspond to Ranks 2 and 1)
  for (let col = 0; col < 8; col++) {
    board[6][col] = { type: 'pawn', color: 'white', hasMoved: false };
    board[7][col] = { type: backRank[col], color: 'white', hasMoved: false };
  }

  return board;
};