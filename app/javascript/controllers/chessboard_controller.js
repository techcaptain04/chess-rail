import { Controller } from "@hotwired/stimulus";
import Chessboard from "chessboardjs";
import { Chess } from "chess.js";

// Connects to data-controller="chessboard"
export default class extends Controller {
  connect() {
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

    this.fetchNextMoves(currentPgn).then(possibleMoves => {
      // Choose a random move from the array of possible moves
      let randomIndex = Math.floor(Math.random() * possibleMoves.length);
      let computerMove = possibleMoves[randomIndex];

      // If there are no known next moves, alert the user
      if (!computerMove) {
        alert("Our opening book doesn't know what to do next!");
        return;
      }

      // Make the move on the board
      try {
        this.game.move(computerMove);
        this.board.position(this.game.fen());
        this.updatePgnView();

        // Console log the current pgn and the next moves
        console.log("pgn: ", this.game.pgn());
        this.fetchNextMoves(this.game.pgn()).then(data => console.log("Next moves: ", data));
      } catch (error) {
        console.log("Error in computer move: ", error);
      }
    });
  }

  fetchNextMoves(pgn) {
    return fetch(`/api/openings/next_moves?pgn=${encodeURIComponent(pgn)}`)
      .then(response => response.json())
      .then(data => data.moves)
      .catch(error => {
        console.error('Error fetching moves:', error);
        return [];
      });
  }
}
