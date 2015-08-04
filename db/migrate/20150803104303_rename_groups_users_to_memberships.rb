class RenameGroupsUsersToMemberships < ActiveRecord::Migration
  def change
		rename_table :groups_users, :memberships
  end
end
