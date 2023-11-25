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
end
