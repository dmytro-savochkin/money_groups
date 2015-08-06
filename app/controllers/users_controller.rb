class UsersController < ApplicationController
	before_action :authenticate_admin_from_token!, only: [:index, :report]


	def index
    render :json => {success: true, users: User.all}
	end


	def show
    render :json => {
               success: true,
               user: {
                   name: current_user.name,
                   age: current_user.age,
                   sex: current_user.sex,
                   money: current_user.money
               }
           }
  end


  def update
    user = User.find_by_id(params[:user_to_edit][:id])
    if user and user.update(params.require(:user_to_edit).permit(:name, :money, :sex, :age, :admin))
      render :json => {success: true, user: user}
    else
      render :json => {success: false, error: user.nil? ? :user_not_found : user.errors}
    end
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
