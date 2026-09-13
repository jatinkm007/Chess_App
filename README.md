# ♟️ Offline Chess Game

A fully functional **offline Chess Game built with React.js** without using any external chess engine or chess library.

The project provides a two-player chess experience with legal move validation, turn management, check/checkmate detection, timers, move history, captured pieces, move highlighting, and undo functionality.

---

## 🚀 Live Demo

🔗 **Live Demo:** [(https://chess-app-j.vercel.app/)]

---

## 📌 Project Overview

This project is a browser-based chess game designed for two players playing on the same device.

The main goal of the project was to implement the core rules and game logic of chess using **JavaScript and React.js**, without depending on libraries such as Chess.js.

The application handles:

- Chessboard rendering
- Initial chess piece setup
- Legal movement of chess pieces
- Turn management
- Check detection
- Checkmate detection
- Stalemate detection
- Player countdown timers
- Move history
- Captured pieces
- Legal move highlighting
- Undo functionality
- Illegal move notifications
- Game-over detection

---

## ✨ Features

### ♟️ Chessboard

- Standard **8 × 8 chessboard**
- Proper alternating light and dark squares
- Initial chess position
- Responsive board layout
- Chess pieces displayed clearly on each square

### 🎯 Legal Moves

The game supports movement rules for all major chess pieces:

- Pawn
- Rook
- Knight
- Bishop
- Queen
- King

Illegal moves are prevented and the player is notified when an invalid move is attempted.

### 🔄 Turn Management

Players automatically alternate turns after every valid move.

- White moves first
- White can only move White pieces
- Black can only move Black pieces
- Players cannot move the opponent's pieces

### 👑 Check Detection

The game detects when a player's king is under attack.

When a king is in check:

- The game displays a check notification
- The player must make a move that removes the check
- Moves that leave the player's own king in check are rejected

### 🏆 Checkmate Detection

The game checks whether the player in check has any legal move available.

Checkmate occurs when:

1. The king is currently in check
2. The king cannot move to safety
3. No other piece can capture the attacking piece
4. No other piece can block the attack

When checkmate occurs, the game ends and the winning player is displayed.

### 🤝 Stalemate Detection

The game also detects stalemate.

A stalemate occurs when:

- The current player is **not in check**
- The current player has **no legal moves**

The game ends as a draw.

### ⏱️ Chess Timer

Each player has an individual countdown timer.

- White's timer runs during White's turn
- Black's timer runs during Black's turn
- The inactive player's timer remains paused
- The game ends when a player's timer reaches zero

###Credits

All Rights Reserved @Jatin

### 📝 Move History

All valid moves are recorded in a move list.

Example:

```text
1. e4 e5
2. Nf3 Nc6
3. Bb5 a6
