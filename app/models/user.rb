class User < ActiveRecord::Base
	devise :registerable, :database_authenticatable

	SEX_VALUES = [:male, :female, :unknown]

	validates :name, length: {minimum: 3}, uniqueness: true
	validates :age, format: { with: /\d+/, message: "only allows digits" }
	validates :sex, :inclusion => {:in => SEX_VALUES.map(&:to_s)}
	validates :password, length: {minimum: 8, maximum: 80}, on: :create
	validates :password, length: {minimum: 8, maximum: 80}, on: :update, allow_blank: true
	validates_numericality_of :money, :greater_than_or_equal_to => 0.0

	enum sex: SEX_VALUES

	has_many :memberships
	has_many :groups, :through => :memberships
	has_many :actions, -> { order('created_at desc') }


	def email_required?
		false
	end

	def email_changed?
		false
	end

	def email
		nil
	end
end
