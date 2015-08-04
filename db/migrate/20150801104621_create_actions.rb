class CreateActions < ActiveRecord::Migration
  def change
    create_table :actions do |t|
			t.integer :group_id
			t.integer :user_id
			t.integer :type
			t.decimal :money, :precision => 8, :scale => 2, :null => true
    end
  end
end
