class Group < ActiveRecord::Base
	has_many :memberships
	has_many :users, :through => :memberships
	has_many :actions

	validates :name, length: {minimum: 3}, uniqueness: true
	validates_numericality_of :money, :greater_than_or_equal_to => 0.0


	scope :with_is_user_joined_field, ->(user_id) { select("(SELECT COUNT(*) FROM memberships
	  WHERE memberships.user_id = #{user_id.to_i} AND memberships.group_id = groups.id) as is_user_in_group ")
	}


	def deposit_or_withdraw_money(type, user, money)
		case type
			when :deposit
				operators = [:+, :-, :money_in]
			when :withdraw
				operators = [:-, :+, :money_out]
			else
				raise ArgumentError.new("Wrong type #{type}. Impossible situation.")
		end
		ActiveRecord::Base.transaction do
			self.update_attributes!(:money => self.money.send(operators[0], money))
			user.update_attributes!(:money => user.money.send(operators[1], money))
		end
		Action.create(user_id: user.id, group_id: id, type: operators[2], money: money)
	end
end
