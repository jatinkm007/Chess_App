import { useEffect, useState, useMemo } from "react";
import ChessBoard from "./components/ChessBoard";
import Timer from "./components/Timer";
import MoveList from "./components/MoveList";
import GameStatus from "./components/GameStatus";
import PromotionModal from "./components/PromotionModal";
import Piece from "./components/Piece";

import { createInitialBoard } from "./utils/initialBoard";
import {
  cloneBoard,
  cloneCastlingRights,
  oppositeColor,
  boardToPositionKey,
  initialPieces,
} from "./utils/gameUtils";

import {
  getLegalMoves,
  isKingInCheck,
  hasAnyLegalMove,
  makeCompleteMove,
  isInsufficientMaterial,
} from "./utils/moveValidation";

import { generateNotation, addCheckSymbol } from "./utils/notation";
import "./App.css";

const createInitialRights = () => ({
  white: { kingSide: true, queenSide: true },
  black: { kingSide: true, queenSide: true },
});

function App() {
  const [board, setBoard] = useState(createInitialBoard());
  const [turn, setTurn] = useState("white");
  const [castlingRights, setCastlingRights] = useState(createInitialRights());
  const [enPassantTarget, setEnPassantTarget] = useState(null);
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [legalMoves, setLegalMoves] = useState([]);
  const [moves, setMoves] = useState([]);
  const [whiteTime, setWhiteTime] = useState(600);
  const [blackTime, setBlackTime] = useState(600);
  const [status, setStatus] = useState("playing");
  const [pendingPromotion, setPendingPromotion] = useState(null);
  const [history, setHistory] = useState([]);
  const [positionHistory, setPositionHistory] = useState([]);
  const [halfmoveClock, setHalfmoveClock] = useState(0);

  const gameOver = !["playing", "check"].includes(status);

  useEffect(() => {
    if (gameOver) return;

    const timer = setInterval(() => {
      if (turn === "white") {
        setWhiteTime((time) => {
          if (time <= 1) {
            setStatus("white-timeout");
            return 0;
          }
          return time - 1;
        });
      } else {
        setBlackTime((time) => {
          if (time <= 1) {
            setStatus("black-timeout");
            return 0;
          }
          return time - 1;
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [turn, gameOver]);

  const getAllLegalMovesForNotation = (currentBoard, color) => {
    const result = [];
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = currentBoard[row][col];
        if (!piece || piece.color !== color) continue;

        const pieceMoves = getLegalMoves(
          currentBoard,
          { row, col },
          color,
          castlingRights,
          enPassantTarget
        );

        for (const move of pieceMoves) {
          result.push({ from: { row, col }, to: move });
        }
      }
    }
    return result;
  };

  const updateGameStatus = (
    newBoard,
    nextTurn,
    newPositionHistory,
    newHalfmoveClock,
    currentCastlingRights,
    currentEnPassant
  ) => {
    const check = isKingInCheck(newBoard, nextTurn);
    const hasMoves = hasAnyLegalMove(
      newBoard,
      nextTurn,
      currentCastlingRights,
      currentEnPassant
    );

    if (!hasMoves && check) {
      setStatus("checkmate");
      return;
    }

    if (!hasMoves && !check) {
      setStatus("stalemate");
      return;
    }

    if (isInsufficientMaterial(newBoard)) {
      setStatus("insufficient");
      return;
    }

    if (newHalfmoveClock >= 100) {
      setStatus("fifty-move");
      return;
    }

    const currentKey = newPositionHistory[newPositionHistory.length - 1];
    const repetitions = newPositionHistory.filter((key) => key === currentKey).length;

    if (repetitions >= 3) {
      setStatus("threefold");
      return;
    }

    if (check) {
      setStatus("check");
    } else {
      setStatus("playing");
    }
  };

  const performMove = (from, to, promotion = null) => {
    const piece = board[from.row][from.col];
    const captured = board[to.row][to.col];

    const result = makeCompleteMove(
      board,
      from,
      to,
      castlingRights,
      enPassantTarget,
      promotion
    );

    const newBoard = result.board;
    const nextTurn = oppositeColor(turn);

    const newHalfmove = piece.type === "pawn" || captured ? 0 : halfmoveClock + 1;

    const newKey = boardToPositionKey(
      newBoard,
      nextTurn,
      result.castlingRights,
      result.enPassantTarget
    );

    const newPositionHistory = [...positionHistory, newKey];

    setHistory((oldHistory) => [
      ...oldHistory,
      {
        board: cloneBoard(board),
        turn,
        castlingRights: cloneCastlingRights(castlingRights),
        enPassantTarget: enPassantTarget ? { ...enPassantTarget } : null,
        whiteTime,
        blackTime,
        moves: [...moves],
        halfmoveClock,
        positionHistory: [...positionHistory],
        status,
      },
    ]);

    let notation = generateNotation({
      board,
      from,
      to,
      capturedPiece: result.capturedPiece,
      promotion,
      castling: to.isCastling ? to.castleSide : null,
      turn,
      getAllLegalMoves: getAllLegalMovesForNotation,
      resultingBoard: newBoard,
    });

    const opponent = oppositeColor(turn);

    notation = addCheckSymbol(
      notation,
      newBoard,
      opponent,
      isKingInCheck,
      hasAnyLegalMove,
      result.castlingRights,
      result.enPassantTarget
    );

    setBoard(newBoard);
    setCastlingRights(result.castlingRights);
    setEnPassantTarget(result.enPassantTarget);

    setTurn(nextTurn);
    setMoves((oldMoves) => [...oldMoves, notation]);
    setHalfmoveClock(newHalfmove);
    setPositionHistory(newPositionHistory);

    setSelectedSquare(null);
    setLegalMoves([]);
    setPendingPromotion(null);

    updateGameStatus(
      newBoard,
      nextTurn,
      newPositionHistory,
      newHalfmove,
      result.castlingRights,
      result.enPassantTarget
    );
  };

  const handleSquareClick = (row, col) => {
    if (gameOver || pendingPromotion) return;

    const clickedPiece = board[row][col];

    if (!selectedSquare) {
      if (clickedPiece && clickedPiece.color === turn) {
        setSelectedSquare({ row, col });
        setLegalMoves(
          getLegalMoves(board, { row, col }, turn, castlingRights, enPassantTarget)
        );
      }
      return;
    }

    if (clickedPiece && clickedPiece.color === turn) {
      setSelectedSquare({ row, col });
      setLegalMoves(
        getLegalMoves(board, { row, col }, turn, castlingRights, enPassantTarget)
      );
      return;
    }

    const move = legalMoves.find((item) => item.row === row && item.col === col);
    if (!move) return;

    const piece = board[selectedSquare.row][selectedSquare.col];

    if (piece.type === "pawn" && (row === 0 || row === 7)) {
      setPendingPromotion({ from: selectedSquare, to: move });
      return;
    }

    performMove(selectedSquare, move);
  };

  const handlePromotion = (promotionPiece) => {
    if (!pendingPromotion) return;
    performMove(pendingPromotion.from, pendingPromotion.to, promotionPiece);
  };

  const undoMove = () => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];

    setBoard(previous.board);
    setTurn(previous.turn);
    setCastlingRights(previous.castlingRights);
    setEnPassantTarget(previous.enPassantTarget);
    setWhiteTime(previous.whiteTime);
    setBlackTime(previous.blackTime);
    setMoves(previous.moves);
    setHalfmoveClock(previous.halfmoveClock);
    setPositionHistory(previous.positionHistory);
    setStatus(previous.status === "check" ? "playing" : previous.status);

    setHistory((oldHistory) => oldHistory.slice(0, -1));
    setSelectedSquare(null);
    setLegalMoves([]);
    setPendingPromotion(null);
  };

  const restartGame = () => {
    const newBoard = createInitialBoard();
    const rights = createInitialRights();
    const key = boardToPositionKey(newBoard, "white", rights, null);

    setBoard(newBoard);
    setTurn("white");
    setCastlingRights(rights);
    setEnPassantTarget(null);
    setSelectedSquare(null);
    setLegalMoves([]);
    setMoves([]);
    setWhiteTime(600);
    setBlackTime(600);
    setStatus("playing");
    setPendingPromotion(null);
    setHistory([]);
    setHalfmoveClock(0);
    setPositionHistory([key]);
  };

  useEffect(() => {
    const key = boardToPositionKey(board, turn, castlingRights, enPassantTarget);
    if (positionHistory.length === 0) {
      setPositionHistory([key]);
    }
  }, []);

  const { whiteCaptured, blackCaptured } = useMemo(() => {
    const wCaptured = [];
    const bCaptured = [];

    const currentPieces = {
      white: { pawn: 0, rook: 0, knight: 0, bishop: 0, queen: 0, king: 0 },
      black: { pawn: 0, rook: 0, knight: 0, bishop: 0, queen: 0, king: 0 },
    };

    board.forEach((row) => {
      row.forEach((piece) => {
        if (piece) currentPieces[piece.color][piece.type]++;
      });
    });

    Object.keys(initialPieces.white).forEach((type) => {
      const difference = initialPieces.white[type] - currentPieces.white[type];
      for (let i = 0; i < difference; i++) wCaptured.push(type);
    });

    Object.keys(initialPieces.black).forEach((type) => {
      const difference = initialPieces.black[type] - currentPieces.black[type];
      for (let i = 0; i < difference; i++) bCaptured.push(type);
    });

    return { whiteCaptured: wCaptured, blackCaptured: bCaptured };
  }, [board]);

  return (
    <div className="app">
      <header>
        <h1>♟ React Chess</h1>
        <p>Offline Chess Game</p>
      </header>

      <main className="game-layout">
        <section className="board-section">
          <div className="player-bar">
            <span className="player-name">Black</span>
            <Timer time={blackTime} active={turn === "black" && !gameOver} />
          </div>

          <div className="captured-pieces">
            {whiteCaptured.map((piece, index) => (
              <Piece key={`w-${piece}-${index}`} piece={{ type: piece, color: "white" }} />
            ))}
          </div>

          <ChessBoard
            board={board}
            selectedSquare={selectedSquare}
            legalMoves={legalMoves}
            turn={turn}
            inCheck={status === "check" || status === "checkmate"}
            onSquareClick={handleSquareClick}
          />

          <div className="captured-pieces">
            {blackCaptured.map((piece, index) => (
              <Piece key={`b-${piece}-${index}`} piece={{ type: piece, color: "black" }} />
            ))}
          </div>

          <div className="player-bar">
            <span className="player-name">White</span>
            <Timer time={whiteTime} active={turn === "white" && !gameOver} />
          </div>
        </section>

        <aside className="sidebar">
          <GameStatus
            turn={turn}
            status={status}
            onRestart={restartGame}
            onUndo={undoMove}
            canUndo={history.length > 0}
          />
          <MoveList moves={moves} />
        </aside>
      </main>

      {pendingPromotion && (
        <PromotionModal color={turn} onSelect={handlePromotion} />
      )}
    </div>
  );
}

export default App;