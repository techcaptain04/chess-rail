class Api::StockfishController < ApplicationController
  def next_move
    fen = params[:fen]

    puts "FEN: #{fen}"

    analysis = Stockfish.analyze fen, { :depth => 12 }

    move = analysis[:bestmove]

    puts "Move: #{move}"

    render json: { move: move }
  end
end
