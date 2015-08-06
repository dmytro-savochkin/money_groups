class GroupsController < ApplicationController
	before_action :authenticate_admin_from_token!, only: [:create, :update, :report]


	def index
		render :json => {
		  success: true,
			groups: Group.includes(:memberships).select('groups.*').with_is_user_joined_field(current_user.id)
    }
	end


	def create
		group = Group.new(name: params[:group][:name], money: 0.0)
		if group.valid? and group.save
			render :json => {success: true, name: group.name, id: group.id}
		else
			render :json => {success: false, error: group.errors}
		end
  end


	def update
		group = Group.find_by_id(params[:group_id])
		if group and group.update(params.require(:group).permit(:name, :money))
			render :json => {success: true, group: group}
		else
			render :json => {success: false, error: group.nil? ? :group_not_found : group.errors}
		end
	end



	def deposit_money
		deposit_or_withdraw_money(:deposit)
	end

	def withdraw_money
		deposit_or_withdraw_money(:withdraw)
	end



	def report
		group = Group.find_by_id(params[:group_id])
		if group
			render :json => {
					success: true,
					actions: Action.detailed_actions(group.actions)
			}
		else
			render :json => {success: false, error: :group_not_found}
		end
	end





	private

	def deposit_or_withdraw_money(type)
		money = params[:user][:money].to_i
		group = Group.find_by_id(params[:group_id])

		unless group
			render_group_not_found
			return
		end
		unless current_user.groups.include? group
			render_user_not_in_group
			return
		end
		if money < 1
			render_wrong_amount
			return
		end

		case type
			when :deposit
				if current_user.money.to_f < money.to_f
					render_not_enough_money_user
					return
				end
			when :withdraw
				if group.money.to_f < money.to_f
					render_not_enough_money_group
					return
				end
			else
				raise ArgumentError.new("Wrong type #{type}. Impossible situation.")
		end

		begin
			group.deposit_or_withdraw_money(type, current_user, money)
			render_success
		rescue StandardError => e
			render :json => {success: false, error: e.message}
		end
	end



	def render_wrong_amount
		render :json => {success: false, error: :zero_or_negative_amount}
	end
	def render_success
		render :json => {success: true}
	end
	def render_group_not_found
		render :json => {success: false, error: :group_not_found}
	end
	def render_not_enough_money_user
		render :json => {success: false, error: :not_enough_money_user}
  end
  def render_not_enough_money_group
    render :json => {success: false, error: :not_enough_money_group}
  end
	def render_user_not_in_group
		render :json => {success: false, error: :user_not_in_group}
	end
end
