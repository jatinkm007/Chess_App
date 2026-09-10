import { useState } from 'react';

function Piece({ piece }) {
  const [imgError, setImgError] = useState(false);

  if (!piece) {
    return null;
  }

  // This dynamically creates strings like "w_pawn.svg" or "b_knight.svg"
  const fileName = `${piece.color[0]}_${piece.type}.svg`;

  // Fallback text symbols just in case an image fails to load
  const fallbackSymbols = {
    white: { king: '♔', queen: '♕', rook: '♖', bishop: '♗', knight: '♘', pawn: '♙' },
    black: { king: '♚', queen: '♛', rook: '♜', bishop: '♝', knight: '♞', pawn: '♟' }
  };

  return (
    <div className={`piece-wrapper ${piece.color}`}>
      {!imgError ? (
        <img
          // Points directly to the root of the public folder
          src={`/${fileName}`}
          alt={`${piece.color} ${piece.type}`}
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          onError={() => setImgError(true)}
        />
      ) : (
        <span style={{ fontSize: 'clamp(28px, 6vw, 50px)' }}>
          {fallbackSymbols[piece.color][piece.type]}
        </span>
      )}
    </div>
  );
}

export default Piece;