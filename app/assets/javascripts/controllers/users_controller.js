moneyGroupsApp.controller('usersController', function($scope, $http, $cookies, Cloner, Store) {
    $scope.$watch(function(scope) { return scope.$parent.user.isAdmin },
        function(value,v) {if(value) $scope.getUsersList()}
    )


    $scope.users = {}
    $scope.usersToEdit = {}
    $scope.usersErrorsWhileEditing = {}
    $scope.editing = {}
    $scope.edited = {}


    $scope.getUsersList = function() {
        $http.get('/users.json', {params: {user: $scope.$parent.getAuthUserObjectFromCookies()}}).
            then(function(data, status) {
                var users = data.data.users
                if(Array.isArray(users)) {
                    for(var i in users) {
                        $scope.users[users[i].id] = users[i]
                        $scope.usersToEdit[users[i].id] = Cloner.clone(users[i])
                        $scope.usersToEdit[users[i].id].money /= 100
                        Store.updateUsers($scope.users)
                    }
                }
                else {
                    console.log('Wrong data type for users.', data.data.users)
                }
            }, function(data, status) {
                console.log('Unknown error: ', data, status)
            })
    }


    $scope.editUser = function(userId) {
        userId = parseInt(userId)
        $scope.usersErrorsWhileEditing[userId] = false
        $scope.editing[userId] = true
        for(var i in $scope.edited)
            $scope.edited[i] = false

        var params = {
            user: $scope.$parent.getAuthUserObjectFromCookies(),
            user_to_edit: Cloner.clone($scope.usersToEdit[userId])
        }
        params.user_to_edit.money = Math.round(params.user_to_edit.money * 100)

        for(var j in $scope.users[userId])
            if(params.user_to_edit[j] === undefined)
                params.user_to_edit[j] = ''

        $http.put('/users/' + userId + '.json', params).
            then(function(data, status) {
                if(data.data.success) {
                    $scope.users[userId] = Cloner.clone(data.data.user)
                    $scope.usersToEdit[userId] = Cloner.clone(data.data.user)
                    $scope.usersToEdit[userId].money /= 100
                    $scope.edited[userId] = true
                    Store.updateUsers($scope.users)
                    if(userId == $scope.$parent.user.id) {
                        updateUserInSessionsController($scope.users[userId])
                    }
                }
                else {
                    if(data.data.error == 'user_not_found') {
                        $scope.usersErrorsWhileEditing[userId] = 'Error. User not found.'
                    }
                    else {
                        var errorMessages = []
                        for(var field in data.data.error) {
                            errorMessages.push(field + ' ' + data.data.error[field].join(', '))
                        }
                        $scope.usersErrorsWhileEditing[userId] = 'Errors: ' + errorMessages.join('; ')
                    }
                }
            }, function(data, status) {
                console.log('Unknown error: ', data, status)
                $scope.usersErrorsWhileEditing[userId] = 'Error: ' + JSON.stringify(data.data.error)
            })
    }




    function updateUserInSessionsController(updatedUser) {
        $scope.$parent.user.name = updatedUser.name
        $scope.$parent.user.money = updatedUser.money
        $scope.$parent.user.age = updatedUser.age
        $scope.$parent.user.sex = updatedUser.sex
        $scope.$parent.user.isAdmin = updatedUser.admin
        $cookies.put('user_name', updatedUser.name)
        $cookies.put('user_is_admin', updatedUser.admin)
    }
})