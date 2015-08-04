class CreateUsers < ActiveRecord::Migration
  def change
    create_table :users do |t|
			t.string :name
			t.decimal :money, :precision => 8, :scale => 2
			t.integer :age
			t.integer :sex
			t.boolean :admin, :default => false
		end
  end
end
