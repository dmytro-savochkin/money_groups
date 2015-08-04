names = ['Group 1', 'Test group']
users = [
		{name: 'Dmitry', money: 100.0, age: 24, sex: :male, password: 'testtest123', admin: true},
		{name: 'Ivan', money: 10.0, age: 50, sex: :male, password: 'testtest123', admin: false},
		{name: 'Marina', money: 500.0, age: 26, sex: :female, password: 'testtest123', admin: false}
]

names.each do |name|
	Group.new(:name => name, :money => rand(5..100).to_f).save
end

users.each do |user|
	User.create(user)
end

