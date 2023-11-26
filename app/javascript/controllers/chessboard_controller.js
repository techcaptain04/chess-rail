import { Controller } from "@hotwired/stimulus";
import Chessboard from "chessboardjs";
import { Chess } from "chess.js";

// Connects to data-controller="chessboard"
export default class extends Controller {
  connect() {
    this.usingOpeningBook = true;

    this.game = new Chess();
    let config = {
      draggable: true,
      position: "start",
      pieceTheme: "/assets/chesspieces/wikipedia/{piece}.png",
      onDragStart: this.onDragStart.bind(this),
      onDrop: this.onDrop.bind(this),
      onSnapEnd: this.onSnapEnd.bind(this)
    };

    this.board = Chessboard('board', config); // Initialize chessboard
  }

  onDragStart(source, piece, position, orientation) {
    // Do not pick up pieces if the game is over
    if (this.game.isGameOver()) {
      console.log("Game over!");
      return false;
    }

    // If not the player's turn
    if ((this.game.turn() === 'w' && piece.search(/^b/) !== -1) ||
        (this.game.turn() === 'b' && piece.search(/^w/) !== -1)) {
      // return false; // Uncomment this to only pick up pieces for the side to move
      console.log("Not your turn!");
    }
  }

  onDrop(source, target) {
    // Only make the move if it's legal
    try {
      this.game.move({
        from: source,
        to: target,
        promotion: "q" // FIXME: allow user to choose promotion piece
      });
    } catch (error) {
      console.log("Illegal move!");
      return 'snapback';
    }

    console.log("pgn: ", this.game.pgn());

    this.updatePgnView();
    this.makeComputerMove();
  }

  // update the board position after the piece snap
  // for castling, en passant, pawn promotion
  onSnapEnd() {
    this.board.position(this.game.fen());
  }

  updatePgnView() {
    // Add newlines before each move number
    let pgn = this.game.pgn().replace(/\d+\./g, "\n$&");
    document.getElementById("pgn").innerHTML = pgn;
  }

  makeComputerMove() {
    let currentPgn = this.game.pgn();

    if(this.usingOpeningBook) {
      this.fetchNextOpeningMoves(currentPgn).then(possibleMoves => {
        if (possibleMoves.length > 0) {
          // If there are opening moves available, use one of them
          let randomIndex = Math.floor(Math.random() * possibleMoves.length);
          let computerMove = possibleMoves[randomIndex];
          this.makeMoveOnBoard(computerMove);
        } else {
          // No more opening moves available, switch to Stockfish
          console.log("End of opening book. Using Stockfish to make next move...");
          this.usingOpeningBook = false;
          this.useStockfishMove();
        }
      });
    } else {
      this.useStockfishMove();
    }
  }

  makeMoveOnBoard(move) {
    try {
      this.game.move(move);
      this.board.position(this.game.fen());
      this.updatePgnView();
      console.log("pgn: ", this.game.pgn());
      if (this.usingOpeningBook) {
        this.fetchNextOpeningMoves(this.game.pgn()).then(data => console.log("Next moves: ", data));
      }
    } catch (error) {
      console.log("Error in computer move: ", error);
    }
  }

  useStockfishMove() {
    let currentFen = this.game.fen();
    this.fetchNextStockfishMove(currentFen).then(stockfishMove => {
      if (stockfishMove) {
        console.log("Stockfish move: ", stockfishMove);
        this.makeMoveOnBoard(stockfishMove);
      } else {
        console.log("Couldn't get a move from Stockfish, something must be fishy...");
      }
    });
  }

  fetchNextOpeningMoves(pgn) {
    return fetch(`/api/openings/next_moves?pgn=${encodeURIComponent(pgn)}`)
      .then(response => response.json())
      .then(data => data.moves)
      .catch(error => {
        console.error('Error fetching moves:', error);
        return [];
      });
  }

  async fetchNextStockfishMove(fen) {
    try {
      const response = await fetch(`/api/stockfish/next_move?fen=${encodeURIComponent(fen)}`);
      const data = await response.json();
      return data.move;
    } catch (error) {
      console.error('Error fetching moves:', error);
      return null;
    }
  }
}
