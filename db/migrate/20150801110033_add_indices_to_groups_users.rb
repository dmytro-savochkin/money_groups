class AddIndicesToGroupsUsers < ActiveRecord::Migration
  def change
		add_index :groups_users, [:user_id, :group_id], :unique => true
  end
end
