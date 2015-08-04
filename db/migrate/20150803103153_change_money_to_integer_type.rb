class ChangeMoneyToIntegerType < ActiveRecord::Migration
  def change
		change_column :users, :money, :integer
		change_column :groups, :money, :integer
		change_column :actions, :money, :integer
  end
end
