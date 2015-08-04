class ActionsController < ApplicationController
	before_action :authenticate_admin_from_token!

	def report
		render :json => {
				success: true,
				actions: Action.detailed_actions(Action.all)
		}
	end
end
