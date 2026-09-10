// src/components/ChessBoard.jsx
import ChessSquare from './ChessSquare';
import { findKing } from '../utils/gameUtils';

function ChessBoard({ board, selectedSquare, legalMoves, turn, inCheck, onSquareClick }) {
  const king = inCheck ? findKing(board, turn) : null;

  return (
    <div className="board-container">
      <div className="chess-board">
        {board.map((row, rowIndex) => row.map((piece, colIndex) => {
          const selected = selectedSquare?.row === rowIndex && selectedSquare?.col === colIndex;
          const legal = legalMoves.some((move) => move.row === rowIndex && move.col === colIndex);
          const checked = inCheck && king && king.row === rowIndex && king.col === colIndex;

          return (
            <ChessSquare
              key={`${rowIndex}-${colIndex}`}
              piece={piece}
              row={rowIndex}
              col={colIndex}
              selected={selected}
              legal={legal}
              checked={checked}
              onClick={() => onSquareClick(rowIndex, colIndex)}
            />
          );
        }))}
      </div>
    </div>
  );
}

export default ChessBoard;