import { Controller } from "@hotwired/stimulus";
import Chessboard from "chessboardjs";
import { Chess } from "chess.js";

// Connects to data-controller="chessboard"
export default class extends Controller {
  connect() {
    this.game = new Chess();

    let board;
    const onDragStart = (source, piece, position, orientation) => {
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
    };

    const onDrop = (source, target) => {
      // prevent default causing reload
      event.preventDefault(); // FIXME: pass event to onDrop

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
    };

    const onSnapEnd = () => {
      board.position(this.game.fen());
    };

    let config = {
      draggable: true,
      position: "start",
      pieceTheme: "/assets/chesspieces/wikipedia/{piece}.png",
      onDragStart: onDragStart,
      onDrop: onDrop,
      onSnapEnd: onSnapEnd
    };

    board = Chessboard('board1', config); // Initialize chessboard
  }
}
