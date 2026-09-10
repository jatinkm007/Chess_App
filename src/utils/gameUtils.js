// src/utils/gameUtils.js
// Expected count for standard Full set piece counts
export const initialPieces = {
  white: { pawn: 8, rook: 2, knight: 2, bishop: 2, queen: 1, king: 1 },
  black: { pawn: 8, rook: 2, knight: 2, bishop: 2, queen: 1, king: 1 },
};

export const isInsideBoard = (row, col) => row >= 0 && row < 8 && col >= 0 && col < 8;

export const oppositeColor = (color) => color === 'white' ? 'black' : 'white';

// Deep clone utilities
export const cloneBoard = (board) => board.map((row) => row.map((piece) => piece ? { ...piece } : null));

export const cloneCastlingRights = (rights) => ({
  white: { kingSide: rights.white.kingSide, queenSide: rights.white.queenSide },
  black: { kingSide: rights.black.kingSide, queenSide: rights.black.queenSide },
});

// Coordinate and String utilities
export const findKing = (board, color) => {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.type === 'king' && piece.color === color) {
        return { row, col };
      }
    }
  }
  return null;
};

export const squareToName = (row, col) => {
  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  return `${files[col]}${8 - row}`;
};

// Generates unique position fragment (partial FEN)
export const boardToPositionKey = (board, turn, castlingRights, enPassantTarget) => {
  let position = '';

  for (let row = 0; row < 8; row++) {
    let empty = 0;
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (!piece) { empty++; continue; }
      
      if (empty > 0) { position += empty; empty = 0; }
      let symbol = piece.type[0];
      if (piece.type === 'knight') symbol = 'n';
      position += piece.color === 'white' ? symbol.toUpperCase() : symbol;
    }
    if (empty > 0) position += empty;
    if (row < 7) position += '/';
  }

  const castling = [
    castlingRights.white.kingSide ? 'K' : '',
    castlingRights.white.queenSide ? 'Q' : '',
    castlingRights.black.kingSide ? 'k' : '',
    castlingRights.black.queenSide ? 'q' : '',
  ].join('') || '-';

  const enPassant = enPassantTarget ? squareToName(enPassantTarget.row, enPassantTarget.col) : '-';

  return `${position} ${turn[0]} ${castling} ${enPassant}`;
};