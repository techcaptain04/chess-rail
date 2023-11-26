class Opening < ApplicationRecord
  def self.search(search)
    if search
      where("name LIKE ?", "%#{search}%")
    else
      all
    end
  end

  def self.search_eco(search)
    if search
      where("eco LIKE ?", "%#{search}%")
    else
      all
    end
  end

  # e.g. Opening.search_pgn("3. Bc4 Bc5 4. d3")
  def self.search_pgn(search)
    if search
      where("pgn LIKE ?", "%#{search}%")
    else
      all
    end
  end

  # Given a PGN string, return a list of next moves from known openings
  # e.g. Opening.next_opening_moves("1. e4 e5 2. Nc3 Nc6")
  # => ["Bc4", "Bc5", "d3"]
  def self.next_opening_moves(pgn)
    matching_openings = Opening.search_pgn(pgn)
    next_moves = []
    matching_openings.each do |opening|
      next_moves << next_move(opening.pgn, pgn)
    end

    # Remove nils and return unique values
    next_moves.compact.uniq
  end

  private

  # Find the next move after a subset of a PGN
  def self.next_move(full_pgn, subset_pgn)
    # Split the full PGN into individual moves
    full_moves = parse_pgn(full_pgn)

    # Split the subset PGN into individual moves
    subset_moves = parse_pgn(subset_pgn)

    # Find the next move after the subset
    next_move_index = subset_moves.length
    full_moves[next_move_index]
  end

  # Parse PGN and return an array of moves
  def self.parse_pgn(pgn)
    # Remove move numbers and split by spaces
    pgn.gsub(/\d+\./, '').split
  end
end
