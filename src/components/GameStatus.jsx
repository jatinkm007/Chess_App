function GameStatus({ turn, status, onRestart, onUndo, canUndo }) {
  let message = "";

  switch (status) {
    case 'checkmate':
      message = turn === 'white' ? 'Checkmate! Black wins.' : 'Checkmate! White wins.';
      break;
    case 'stalemate':
      message = 'Stalemate! Draw.';
      break;
    case 'threefold':
      message = 'Draw! Threefold repetition.';
      break;
    case 'fifty-move':
      message = 'Draw! 50-move rule.';
      break;
    case 'insufficient':
      message = 'Draw! Insufficient material.';
      break;
    case 'white-timeout':
      message = "White's time is over! Black wins.";
      break;
    case 'black-timeout':
      message = "Black's time is over! White wins.";
      break;
    case 'check':
      message = turn === 'white' ? 'White is in check!' : 'Black is in check!';
      break;
    default:
      message = turn === 'white' ? "White's Turn" : "Black's Turn";
  }

  return (
    <div className="game-status">
      <h2>{message}</h2>

      <div className="game-buttons">
        <button onClick={onRestart}>New Game</button>
        <button onClick={onUndo} disabled={!canUndo}>Undo</button>
      </div>
    </div>
  );
}

export default GameStatus;