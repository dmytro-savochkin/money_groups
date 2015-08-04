class Membership < ActiveRecord::Base
	belongs_to :group
	belongs_to :user

	validates_uniqueness_of :user_id, :scope => :group_id, :message => 'you have already joined this group'

	after_save {|gu| Action.create(user_id: gu.user_id, group_id: gu.group_id, type: :user_in, money: nil)}
	after_destroy {|gu| Action.create(user_id: gu.user_id, group_id: gu.group_id, type: :user_out, money: nil)}
end
