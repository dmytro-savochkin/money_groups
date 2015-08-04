class UsersController < ApplicationController
	before_action :authenticate_admin_from_token!, only: [:index, :report]


	def index
		@users = User.all
	end



	def join_group
		group = Group.find_by_id(params[:group_id])
		membership = Membership.new(user_id: current_user.id, group_id: params[:group_id])
		if group and membership.save
			render :json => {success: true}
		else
			render :json => {success: false, error: group.nil? ? :group_not_found : membership.errors}
		end
	end

	def leave_group
		membership = Membership.find_by(user_id: current_user.id, group_id: params[:group_id])
		if membership and membership.destroy
			render :json => {success: true}
		else
			render :json => {success: false, error: membership.nil? ? :not_in_group : membership.errors}
		end
	end


	def report
		user = User.find_by_id(params[:user_id])
		if user
			render :json => {
					success: true,
					actions: Action.detailed_actions(user.actions)
			}
		else
			render :json => {success: false, error: :user_not_found}
		end
	end
end
