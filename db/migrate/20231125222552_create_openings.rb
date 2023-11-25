class CreateOpenings < ActiveRecord::Migration[7.1]
  def change
    create_table :openings do |t|
      t.string :eco
      t.string :name
      t.text :pgn

      t.timestamps
    end
  end
end
