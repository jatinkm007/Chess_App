import {
  cloneBoard,
  cloneCastlingRights,
  findKing,
  isInsideBoard,
  oppositeColor,
} from "./gameUtils";

const getSlidingMoves = (board, from, directions) => {
  const moves = [];
  const piece = board[from.row]?.[from.col];
  if (!piece) return moves;

  for (const [rowDirection, colDirection] of directions) {
    let row = from.row + rowDirection;
    let col = from.col + colDirection;

    while (isInsideBoard(row, col)) {
      const target = board[row][col];
      if (!target) {
        moves.push({ row, col });
      } else {
        if (target.color !== piece.color) {
          moves.push({ row, col });
        }
        break;
      }
      row += rowDirection;
      col += colDirection;
    }
  }
  return moves;
};

const getPseudoMoves = (board, from, castlingRights = {}, enPassantTarget = null) => {
  const piece = board[from.row]?.[from.col];
  if (!piece) return [];

  const moves = [];

  if (piece.type === "pawn") {
    const direction = piece.color === "white" ? -1 : 1;
    const startRow = piece.color === "white" ? 6 : 1;
    const oneStep = from.row + direction;

    if (isInsideBoard(oneStep, from.col) && !board[oneStep][from.col]) {
      moves.push({ row: oneStep, col: from.col });
      const twoStep = from.row + direction * 2;
      if (from.row === startRow && !board[twoStep][from.col]) {
        moves.push({ row: twoStep, col: from.col });
      }
    }

    for (const colOffset of [-1, 1]) {
      const targetRow = from.row + direction;
      const targetCol = from.col + colOffset;
      if (!isInsideBoard(targetRow, targetCol)) continue;

      const target = board[targetRow][targetCol];
      if (target && target.color !== piece.color) {
        moves.push({ row: targetRow, col: targetCol });
      }
      if (
        enPassantTarget &&
        enPassantTarget.row === targetRow &&
        enPassantTarget.col === targetCol
      ) {
        moves.push({ row: targetRow, col: targetCol, isEnPassant: true });
      }
    }
  }

  if (piece.type === "knight") {
    const offsets = [
      [-2, -1], [-2, 1], [-1, -2], [-1, 2],
      [1, -2], [1, 2], [2, -1], [2, 1],
    ];
    for (const [dr, dc] of offsets) {
      const r = from.row + dr;
      const c = from.col + dc;
      if (!isInsideBoard(r, c)) continue;
      const target = board[r][c];
      if (!target || target.color !== piece.color) {
        moves.push({ row: r, col: c });
      }
    }
  }

  if (piece.type === "bishop") {
    moves.push(...getSlidingMoves(board, from, [[-1, -1], [-1, 1], [1, -1], [1, 1]]));
  }

  if (piece.type === "rook") {
    moves.push(...getSlidingMoves(board, from, [[-1, 0], [1, 0], [0, -1], [0, 1]]));
  }

  if (piece.type === "queen") {
    moves.push(
      ...getSlidingMoves(board, from, [
        [-1, -1], [-1, 1], [1, -1], [1, 1],
        [-1, 0], [1, 0], [0, -1], [0, 1],
      ])
    );
  }

  if (piece.type === "king") {
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const r = from.row + dr;
        const c = from.col + dc;
        if (!isInsideBoard(r, c)) continue;
        const target = board[r][c];
        if (!target || target.color !== piece.color) {
          moves.push({ row: r, col: c });
        }
      }
    }

    // Rock solid castling validation
    const row = piece.color === "white" ? 7 : 0;
    const rights = castlingRights?.[piece.color] || { kingSide: false, queenSide: false };
    const enemy = oppositeColor(piece.color);

    if (
      from.row === row &&
      from.col === 4 &&
      !isKingInCheck(board, piece.color)
    ) {
      if (
        rights.kingSide &&
        board[row][5] === null &&
        board[row][6] === null &&
        board[row][7]?.type === "rook" &&
        board[row][7]?.color === piece.color &&
        !isSquareAttacked(board, row, 5, enemy) &&
        !isSquareAttacked(board, row, 6, enemy)
      ) {
        moves.push({ row, col: 6, isCastling: true, castleSide: "kingSide" });
      }

      if (
        rights.queenSide &&
        board[row][1] === null &&
        board[row][2] === null &&
        board[row][3] === null &&
        board[row][0]?.type === "rook" &&
        board[row][0]?.color === piece.color &&
        !isSquareAttacked(board, row, 3, enemy) &&
        !isSquareAttacked(board, row, 2, enemy)
      ) {
        moves.push({ row, col: 2, isCastling: true, castleSide: "queenSide" });
      }
    }
  }

  return moves;
};

export const isSquareAttacked = (board, row, col, attackingColor) => {
  const pawnRow = attackingColor === "white" ? row + 1 : row - 1;
  for (const pawnCol of [col - 1, col + 1]) {
    if (isInsideBoard(pawnRow, pawnCol)) {
      const piece = board[pawnRow][pawnCol];
      if (piece && piece.color === attackingColor && piece.type === "pawn") {
        return true;
      }
    }
  }

  const knightOffsets = [
    [-2, -1], [-2, 1], [-1, -2], [-1, 2],
    [1, -2], [1, 2], [2, -1], [2, 1],
  ];
  for (const [dr, dc] of knightOffsets) {
    const r = row + dr;
    const c = col + dc;
    if (!isInsideBoard(r, c)) continue;
    const piece = board[r][c];
    if (piece && piece.color === attackingColor && piece.type === "knight") {
      return true;
    }
  }

  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const r = row + dr;
      const c = col + dc;
      if (!isInsideBoard(r, c)) continue;
      const piece = board[r][c];
      if (piece && piece.color === attackingColor && piece.type === "king") {
        return true;
      }
    }
  }

  const directions = [
    { pieces: ["rook", "queen"], directions: [[-1, 0], [1, 0], [0, -1], [0, 1]] },
    { pieces: ["bishop", "queen"], directions: [[-1, -1], [-1, 1], [1, -1], [1, 1]] },
  ];

  for (const group of directions) {
    for (const [dr, dc] of group.directions) {
      let r = row + dr;
      let c = col + dc;
      while (isInsideBoard(r, c)) {
        const piece = board[r][c];
        if (!piece) {
          r += dr;
          c += dc;
          continue;
        }
        if (piece.color === attackingColor && group.pieces.includes(piece.type)) {
          return true;
        }
        break;
      }
    }
  }
  return false;
};

export const isKingInCheck = (board, color) => {
  const king = findKing(board, color);
  if (!king) return false;
  return isSquareAttacked(board, king.row, king.col, oppositeColor(color));
};

export const applyMove = (board, from, to, promotion = null) => {
  const newBoard = cloneBoard(board);
  const piece = newBoard[from.row]?.[from.col];

  if (!piece) return { board: newBoard, capturedPiece: null };

  let capturedPiece = newBoard[to.row][to.col];
  newBoard[from.row][from.col] = null;

  if (to.isEnPassant && piece.type === "pawn") {
    const captureRow = piece.color === "white" ? to.row + 1 : to.row - 1;
    capturedPiece = newBoard[captureRow][to.col];
    newBoard[captureRow][to.col] = null;
  }

  const movedPiece = { ...piece, hasMoved: true };
  if (piece.type === "pawn" && (to.row === 0 || to.row === 7) && promotion) {
    movedPiece.type = promotion;
  }
  newBoard[to.row][to.col] = movedPiece;

  if (to.isCastling && piece.type === "king") {
    const row = from.row;
    if (to.col === 6) {
      newBoard[row][5] = { ...newBoard[row][7], hasMoved: true };
      newBoard[row][7] = null;
    }
    if (to.col === 2) {
      newBoard[row][3] = { ...newBoard[row][0], hasMoved: true };
      newBoard[row][0] = null;
    }
  }

  return { board: newBoard, capturedPiece };
};

const updateCastlingRights = (rights, board, from, to, capturedPiece) => {
  const safeRights = rights || {
    white: { kingSide: false, queenSide: false },
    black: { kingSide: false, queenSide: false }
  };
  const newRights = cloneCastlingRights(safeRights);

  const piece = board[from.row]?.[from.col];
  if (!piece) return newRights;

  if (piece.type === "king") {
    newRights[piece.color].kingSide = false;
    newRights[piece.color].queenSide = false;
  }

  if (piece.type === "rook") {
    if (piece.color === "white" && from.row === 7 && from.col === 0) newRights.white.queenSide = false;
    if (piece.color === "white" && from.row === 7 && from.col === 7) newRights.white.kingSide = false;
    if (piece.color === "black" && from.row === 0 && from.col === 0) newRights.black.queenSide = false;
    if (piece.color === "black" && from.row === 0 && from.col === 7) newRights.black.kingSide = false;
  }

  if (capturedPiece && capturedPiece.type === "rook") {
    if (capturedPiece.color === "white" && to.row === 7 && to.col === 0) newRights.white.queenSide = false;
    if (capturedPiece.color === "white" && to.row === 7 && to.col === 7) newRights.white.kingSide = false;
    if (capturedPiece.color === "black" && to.row === 0 && to.col === 0) newRights.black.queenSide = false;
    if (capturedPiece.color === "black" && to.row === 0 && to.col === 7) newRights.black.kingSide = false;
  }

  return newRights;
};

export const makeCompleteMove = (board, from, to, castlingRights, enPassantTarget, promotion) => {
  const result = applyMove(board, from, to, promotion);
  const newCastlingRights = updateCastlingRights(castlingRights, board, from, to, result.capturedPiece);

  let newEnPassantTarget = null;
  const piece = board[from.row]?.[from.col];

  if (piece && piece.type === "pawn" && Math.abs(to.row - from.row) === 2) {
    newEnPassantTarget = {
      row: (from.row + to.row) / 2,
      col: from.col,
    };
  }

  return { ...result, castlingRights: newCastlingRights, enPassantTarget: newEnPassantTarget };
};

export const isLegalMove = (board, from, to, turn, castlingRights = {}, enPassantTarget = null) => {
  const piece = board[from.row]?.[from.col];
  if (!piece || piece.color !== turn) return false;

  const pseudoMoves = getPseudoMoves(board, from, castlingRights, enPassantTarget);
  const specialMove = pseudoMoves.find((move) => move.row === to.row && move.col === to.col);
  if (!specialMove) return false;

  const moveData = { ...to, ...specialMove };
  const result = applyMove(board, from, moveData, piece.type === "pawn" && (to.row === 0 || to.row === 7) ? "queen" : null);

  if (isKingInCheck(result.board, turn)) return false;

  return true;
};

export const getLegalMoves = (board, position, turn, castlingRights = {}, enPassantTarget = null) => {
  const pseudoMoves = getPseudoMoves(board, position, castlingRights, enPassantTarget);
  return pseudoMoves.filter((move) => isLegalMove(board, position, move, turn, castlingRights, enPassantTarget));
};

export const hasAnyLegalMove = (board, color, castlingRights = {}, enPassantTarget = null) => {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (!piece || piece.color !== color) continue;

      const moves = getLegalMoves(board, { row, col }, color, castlingRights, enPassantTarget);
      if (moves.length > 0) return true;
    }
  }
  return false;
};

export const isInsufficientMaterial = (board) => {
  const pieces = [];
  board.forEach((row) => row.forEach((piece) => piece && pieces.push(piece)));

  if (pieces.length === 2) return true;
  if (pieces.length === 3) {
    return pieces.some((p) => p.type === "bishop" || p.type === "knight");
  }
  if (pieces.length === 4) {
    const minorPieces = pieces.filter((p) => p.type === "bishop");
    if (minorPieces.length === 2) {
      const bishopSquares = [];
      board.forEach((r, rowIdx) =>
        r.forEach((piece, colIdx) => {
          if (piece?.type === "bishop") bishopSquares.push((rowIdx + colIdx) % 2);
        })
      );
      return bishopSquares.length === 2 && bishopSquares[0] === bishopSquares[1];
    }
  }
  return false;
};