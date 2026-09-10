import Piece from './Piece';

function ChessSquare({ piece, row, col, selected, legal, checked, onClick }) {
  const isDark = (row + col) % 2 !== 0;

  // Coordinate indicators
  const showRank = col === 0;
  const showFile = row === 7;
  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

  return (
    <button
      // Notice we removed the 'legal' class from here since we render it explicitly below
      className={`chess-square ${isDark ? 'dark' : 'light'} ${selected ? 'selected' : ''} ${checked ? 'checked' : ''}`}
      onClick={onClick}
    >
      {/* Corner coordinate labels */}
      {showRank && <span className="coord coord-rank">{8 - row}</span>}
      {showFile && <span className="coord coord-file">{files[col]}</span>}

      {/* The actual piece */}
      {piece && <Piece piece={piece} />}

      {/* Bulletproof Legal Move Indicators (Absolutely Positioned) */}
      {legal && !piece && <span className="move-dot"></span>}
      {legal && piece && <span className="capture-ring"></span>}
    </button>
  );
}

export default ChessSquare;