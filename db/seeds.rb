names = ['Group 1', 'Test group']
users = [
		{name: 'dmitry', money: 100.0, age: 24, sex: :male, password: 'testtest123', admin: false},
		{name: 'ivan', money: 10.0, age: 50, sex: :unknown, password: 'testtest123', admin: false},
		{name: 'admin', money: 500.0, age: 26, sex: :male, password: 'testtest123', admin: true}
]

names.each do |name|
	Group.new(:name => name, :money => rand(5..100).to_f).save
end

users.each do |user|
	User.create(user)
end

