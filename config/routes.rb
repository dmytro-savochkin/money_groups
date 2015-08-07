Rails.application.routes.draw do
	devise_for :users, :skip => [:registrations, :sessions],
						 :controllers => {registrations: "registrations", sessions: "sessions"}
	devise_scope :user do
		post '/login' => 'sessions#create', :as => :user_session
		delete '/logout' => 'sessions#destroy', :as => :destroy_user_session
		post '/registration' => 'registrations#create', :as => :new_user_registration
		get '/edit_user' => 'registrations#edit', :as => :edit_user
		put '/update_user' => 'registrations#update', :as => :update_user
	end

	get '/users' => 'users#index'
	get '/user_info' => 'users#show'
	put '/users/:user_id' => 'users#update'

	get '/groups' => 'groups#index'
	post '/groups' => 'groups#create'
	put '/groups/:group_id' => 'groups#update'

	post '/groups/:group_id/join' => 'users#join_group'
	put '/groups/:group_id/leave' => 'users#leave_group'

	put '/groups/:group_id/deposit_money' => 'groups#deposit_money'
	put '/groups/:group_id/withdraw_money' => 'groups#withdraw_money'

	get '/users/:user_id/report' => 'users#report'
	get '/groups/:group_id/report' => 'groups#report'
	get '/actions/report' => 'actions#report'

	root 'main#index'
end
