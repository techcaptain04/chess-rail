class Api::OpeningsController < ApplicationController
  def next_moves
    pgn = params[:pgn]
    moves = Opening.next_opening_moves(pgn)
    render json: { moves: moves }
  end
end
