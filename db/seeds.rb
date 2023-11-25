# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end

require 'csv'

# List of your TSV files
tsv_files = ['./openings/a.tsv', './openings/b.tsv', './openings/c.tsv', './openings/d.tsv', './openings/e.tsv']

tsv_files.each do |file_name|
  file_path = Rails.root.join('db', file_name)

  CSV.foreach(file_path, col_sep: "\t", headers: true) do |row|
    Opening.create!(
      eco: row['eco'],
      name: row['name'],
      pgn: row['pgn']
    )
  rescue StandardError => e
    puts "Unable to save opening: #{row['name']} from file #{file_name}, Error: #{e.message}"
  end
end
