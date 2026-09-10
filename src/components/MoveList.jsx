function MoveList({ moves }) {
  return (
    <div className="move-list">
      <h3>Move History</h3>

      {moves.length === 0 ? (
        <p className="empty">No moves yet</p>
      ) : (
        <div className="moves">
          {moves.map((move, index) => {
            if (index % 2 !== 0) return null;

            return (
              <div className="move-row" key={index}>
                <span>{Math.floor(index / 2) + 1}.</span>
                <span>{move}</span>
                <span>{moves[index + 1] || ""}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default MoveList;