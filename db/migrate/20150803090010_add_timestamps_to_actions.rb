class AddTimestampsToActions < ActiveRecord::Migration
  def change
		add_column :actions, :created_at, :datetime
  end
end
