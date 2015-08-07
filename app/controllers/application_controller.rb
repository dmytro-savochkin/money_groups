class ApplicationController < ActionController::Base
	skip_before_action :verify_authenticity_token
	before_action :authenticate_user_from_token!


	private

	def authenticate_user_from_token!
		if params[:user]
      if params[:user].kind_of? String
        params[:user] = JSON.parse params[:user]
      end
			user_id = params[:user][:id]
			user_auth_token = params[:user][:authentication_token]
		else
			user_id = request.headers["X-NAME"]
			user_auth_token = request.headers["X-TOKEN"]
		end
		user = user_id && User.find_by_id(user_id)
		if user && Devise.secure_compare(user.authentication_token, user_auth_token)
			sign_in(user, store: false)
			user
    else
			render :json => {success: false, error: :invalid_token}
			return
		end
	end


	def authenticate_admin_from_token!
		user = authenticate_user_from_token!
		if user.admin?
			user
		else
			render :json => {success: false, error: :not_admin}
			return
		end
	end


	def render_no_params_sent
		render :json => {success: false, error: :no_params_sent}
	end
end
