class RegistrationsController < ApplicationController
	skip_before_action :authenticate_user_from_token!, only: [:create]


	def create
		params[:user][:sex] = :unknown unless User::SEX_VALUES.map(&:to_s).include?(params[:user][:sex].to_s)
		user = User.new(
				password: params[:user][:password],
				name: params[:user][:name],
				age: params[:user][:age],
				sex: params[:user][:sex],
				money: 0.0,
				admin: false
		)
		if user.valid?
			user.save
			render :json => {success: true, name: user.name}
		else
			render :json => {success: false, error: user.errors}
		end
	end



	def edit
		user = User.find_by_id(params[:user][:id])
		render :json => {success: true,
				user: user.attributes.except('authentication_token', 'encrypted_password')
		}
	end


	def update
		user = User.find_by_id(params[:user][:id])
		if user.update(params.require(:user).permit(:name, :age, :sex, :money))
			render :json => {success: true, name: user.name}
		else
			render :json => {success: false, error: user.errors}
		end
	end
end