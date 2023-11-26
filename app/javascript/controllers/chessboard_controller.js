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
    console.log("fen: ", this.game.fen());

    this.updatePgnView();
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
}
