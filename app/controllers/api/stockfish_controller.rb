class Api::StockfishController < ApplicationController
  def next_move
    fen = params[:fen]

    analysis = Stockfish.analyze fen, { :depth => 20 }

    move = analysis[:bestmove]

    render json: { move: move }
  end
end
