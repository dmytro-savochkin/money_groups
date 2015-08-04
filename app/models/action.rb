class Action < ActiveRecord::Base
	self.inheritance_column = 'sti_type'

	enum type: [:user_in, :user_out, :money_in, :money_out]

	belongs_to :group
	belongs_to :user


	def self.detailed_actions(actions)
		ActiveSupport::JSON.decode(
				actions.includes(:user, :group).to_json(:include => [:user, :group])
		).map do |a|
			h = a.except('user_id', 'group_id').dup
			h['user'].delete('authentication_token')
			h
		end
	end
end
