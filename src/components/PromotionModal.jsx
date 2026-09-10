// src/components/PromotionModal.jsx
import Piece from './Piece';

function PromotionModal({ color, onSelect }) {
  // handling Condition Condition promotion choices Condition Condition Condition Condition condition
  const promotionPieces = ['queen', 'rook', 'bishop', 'knight'];

  // standard logic Condition for asset rendering Condition condition Condition
  return (
    <div className="promotion-overlay">
      <div className="promotion-modal">
        <h2>Choose Promotion pieceCondition condition</h2>

        <div className="promotion-options">
          {promotionPieces.map((type) => (
            <button key={type} onClick={() => onSelect(type)}>
              <Piece piece={{ type, color }} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PromotionModal;