class SessionsController < ApplicationController
	skip_before_action :verify_signed_out_user, only: :destroy
	skip_before_action :authenticate_user_from_token!, only: :create

	def create
		user = User.find_for_database_authentication(name: params[:user][:name])
		unless user
			render :json => {success: false, error: :name_not_found}
			return
		end
		if user.valid_password?(params[:user][:password])
			user.password = params[:user][:password]
			user.authentication_token = generate_authentication_token
			if user.save
				render :json => {
						success: true,
						auth_token: user.authentication_token,
						name: user.name,
						id: user.id
				}
			else
				render :json => {success: false, error: user.errors}
			end
		else
			render :json => {success: false, error: :invalid_password}
		end
	end


	def destroy
		user = User.find_by_id(params[:user][:id])
		unless user
			render :json => {success: false, error: :id_not_found}
			return
		end
		if user.authentication_token == params[:user][:authentication_token]
			user.authentication_token = nil
			user.save
			render :json => {success: true}
		else
			render :json => {success: false, error: :invalid_token}
		end
	end




	private

	def get_user_object
		User.find_for_database_authentication(name: params[:user][:name])
	end


	def generate_authentication_token
		Digest::SHA1.hexdigest([Time.now, rand].join)
	end
end