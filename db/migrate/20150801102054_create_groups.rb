class CreateGroups < ActiveRecord::Migration
  def change
    create_table :groups do |t|
      t.string :name
      t.decimal :money, :precision => 8, :scale => 2
    end
  end
end
