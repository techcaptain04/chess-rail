import { Controller } from "@hotwired/stimulus";
import Chessboard from "chessboardjs";

// Connects to data-controller="chessboard"
export default class extends Controller {
  connect() {
    let config = {
      draggable: true,
      position: "start",
      pieceTheme: "/assets/chesspieces/wikipedia/{piece}.png",
    };

    Chessboard('board1', config); // Initialize chessboard
  }
}
