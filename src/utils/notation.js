import { squareToName } from "./gameUtils";

const pieceLetters = {
  king: "K",
  queen: "Q",
  rook: "R",
  bishop: "B",
  knight: "N",
};

const files = ["a", "b", "c", "d", "e", "f", "g", "h"];

export const generateNotation = ({
  board,
  from,
  to,
  capturedPiece,
  promotion,
  castling,
  turn,
  getAllLegalMoves,
}) => {
  const piece = board[from.row]?.[from.col];
  if (!piece) return "";

  if (castling === "kingSide") return "O-O";
  if (castling === "queenSide") return "O-O-O";

  let notation = "";

  if (piece.type !== "pawn") {
    notation += pieceLetters[piece.type];

    const alternatives = getAllLegalMoves(board, turn).filter(
      (move) =>
        move.to.row === to.row &&
        move.to.col === to.col &&
        !(move.from.row === from.row && move.from.col === from.col)
    );

    if (alternatives.length > 0) {
      const sameFile = alternatives.some((m) => m.from.col === from.col);
      const sameRank = alternatives.some((m) => m.from.row === from.row);

      if (!sameFile) {
        notation += files[from.col];
      } else if (!sameRank) {
        notation += 8 - from.row;
      } else {
        notation += files[from.col] + (8 - from.row);
      }
    }
  }

  const isCapture = Boolean(capturedPiece) || to.isEnPassant;
  if (piece.type === "pawn" && isCapture) {
    notation += files[from.col];
  }

  if (isCapture) notation += "x";

  notation += squareToName(to.row, to.col);

  if (promotion) {
    notation += `=${pieceLetters[promotion]}`;
  }

  return notation;
};

export const addCheckSymbol = (
  notation,
  board,
  opponentColor,
  isKingInCheck,
  hasAnyLegalMove,
  castlingRights = {},
  enPassantTarget = null
) => {
  // If no check, just return the standard notation
  if (!isKingInCheck(board, opponentColor)) {
    return notation;
  }

  // If in check AND they have no legal moves, it is checkmate
  if (!hasAnyLegalMove(board, opponentColor, castlingRights, enPassantTarget)) {
    return `${notation}#`;
  }

  // Otherwise, it is just a check
  return `${notation}+`;
};