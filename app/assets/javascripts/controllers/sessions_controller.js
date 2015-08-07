moneyGroupsApp.controller('sessionsController', function($scope, $http, $cookies) {
    $scope.status = {
        login: {submitted: false, processing: false},
        registration: {submitted: false, processing: false}
    }
    $scope.user = {
        sex: 'unknown',
        errors: {login: {}},
        saved: false,
        money: 'loading...',
        isAdmin: false
    }
    $scope.cookies = $cookies
    $scope.user.loggedIn = ($cookies.get('user_id') ? true : false)
    $scope.user.isAdmin = ($cookies.get('user_is_admin') == 'true')
    $scope.user.id = $cookies.get('user_id')


    $scope.registration = function() {
        $scope.status.registration.processing = true
        var usedFields = ['name', 'password', 'age']
        for(var i in usedFields) {
            $scope.signUpForm[usedFields[i]].$setValidity(usedFields[i], true)
        }
        $scope.status.registration.submitted = true

        $http.post('/registration.json', {user: $scope.user}).then(function(data, status) {
            $scope.status.registration.processing = false
            if(data.data.success) {
                $scope.user.saved = true
            }
            else {
                for(var error_field in data.data.errors) {
                    $scope.signUpForm[error_field].$setValidity(error_field, false)
                    $scope.user.errors[error_field] = data.data.errors[error_field].join(', ')
                }
            }
        }, function(data, status) {
            $scope.status.registration.processing = false
            $scope.user.errors.unknown = true
            console.log('Unknown error: ', data, status)
        })
    }


    $scope.login = function() {
        $scope.status.login.processing = true
        $scope.status.login.submitted = true
        Object.keys($scope.user.errors.login).forEach(function(key){
            $scope.user.errors.login[key] = false
        })
        var usedFields = ['name', 'password']
        for(var i in usedFields) {
            $scope.signInForm[usedFields[i]].$setValidity(usedFields[i], true)
        }

        $http.post('/login.json', {user: $scope.user}).then(function(data, status) {
            $scope.status.login.processing = false
            if(data.data.success) {
                $scope.user.loggedIn = true
                $scope.user.money = data.data.money
                $scope.user.isAdmin = data.data.admin
                $cookies.put('user_id', data.data.id)
                $cookies.put('user_name', data.data.name)
                $cookies.put('user_authentication_token', data.data.authentication_token)
                $cookies.put('user_is_admin', data.data.admin)
            }
            else {
                if(data.data.errors) {
                    for(var error_field in data.data.errors) {
                        $scope.signInForm[error_field].$setValidity(error_field, false)
                        $scope.user.errors[error_field] = data.data.errors[error_field].join(', ')
                        $scope.user.errors.login.unknown = true
                    }
                }
                else {
                    switch(data.data.error) {
                        case 'name_not_found':
                            $scope.signInForm.name.$setValidity('name', false)
                            $scope.user.errors.login.nameNotFound = true
                            break
                        case 'invalid_password':
                            $scope.signInForm.password.$setValidity('password', false)
                            $scope.user.errors.login.invalidPassword = true
                            break
                        default:
                            $scope.user.errors.login.unknown = true
                    }
                }
            }
        }, function(data, status) {
            $scope.status.login.processing = false
            $scope.user.errors.login.unknown = true
            console.log('Unknown error: ', data, status)
        })
    }


    $scope.logout = function() {
        $scope.user.loggedIn = false
        $cookies.remove('user_id')
        $cookies.remove('user_name')
        $cookies.remove('user_authentication_token')
        $cookies.remove('user_is_admin')
    }


    $scope.getAuthUserObjectFromCookies = function() {
        var user = {}
        user.id = $cookies.get('user_id')
        user.authentication_token = $cookies.get('user_authentication_token')
        return user
    }




    if($scope.user.loggedIn) {
        $http.get('/user_info.json', {params: {user: $scope.getAuthUserObjectFromCookies()}}).
            then(function(data, status) {
                $scope.user.money = data.data.user.money
            }, function(data, status) {
                console.log('Unknown error: ', data, status)
            })
    }
});