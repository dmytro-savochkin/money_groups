moneyGroupsApp.controller('groupsController', function($scope, $http, $cookies, Cloner, Store) {
    $scope.$watch(function(scope) { return scope.$parent.user.loggedIn },
        function(value) {if(value) $scope.getGroupsList()}
    )


    $scope.processing = false
    $scope.lastOperation = ''
    $scope.lastOperationVerb = ''
    $scope.lastOperationAmount = 0.00
    $scope.groups = {}
    $scope.groupsToEdit = {}
    $scope.groupsErrorsWhileEditing = {}
    $scope.amountsToChange = {deposit: {}, withdraw: {}}
    $scope.newGroupName = undefined
    $scope.newGroupCreated = false
    $scope.newGroupError = false
    $scope.editing = {}
    $scope.edited = {}


    $scope.getGroupsList = function() {
        $http.get('/groups.json', {params: {user: $scope.$parent.getAuthUserObjectFromCookies()}}).
            then(function(data, status) {
                var groups = data.data.groups
                if(Array.isArray(groups)) {
                    for(var i in groups) {
                        $scope.groups[groups[i].id] = groups[i]
                        $scope.groupsToEdit[groups[i].id] = Cloner.clone(groups[i])
                        $scope.groupsToEdit[groups[i].id].money /= 100
                        Store.updateGroups($scope.groups)
                    }
                }
                else {
                    console.log('Wrong data type for groups.', data.data)
                }
            }, function(data, status) {
                console.log('Unknown error: ', data, status)
            })
    }


    $scope.joinGroup = function(groupId) {
        joinOrLeave('join', groupId)
    }


    $scope.leaveGroup = function(groupId) {
        joinOrLeave('leave', groupId)
    }


    $scope.depositToGroup = function(groupId) {
        setLastOperation('deposit')
        depositOrWithdraw('deposit', groupId)
    }


    $scope.withdrawFromGroup = function(groupId) {
        setLastOperation('withdraw')
        depositOrWithdraw('withdraw', groupId)
    }


    $scope.createGroup = function() {
        $scope.newGroupCreated = false
        $scope.newGroupError = false
        var params = {
            group: {name: $scope.newGroupName},
            user: $scope.$parent.getAuthUserObjectFromCookies()
        }
        $http.post('/groups.json', params).
            then(function(data, status) {
                if(data.data.success) {
                    $scope.groups[data.data.id] = {
                        id: data.data.id,
                        name: data.data.name,
                        money: 0,
                        is_user_in_group: 0
                    }
                    $scope.newGroupCreated = true
                    Store.updateGroups($scope.groups)
                }
                else {
                    if(data.data.error.name != undefined) {
                        $scope.newGroupError = 'name_already_taken'
                    }
                    else {
                        $scope.newGroupError = data.data.error
                    }
                }
            }, function(data, status) {
                $scope.newGroupError = data.data.error
                console.log('Unknown error: ', data, status)
            })
    }


    $scope.editGroup = function(groupId) {
        groupId = parseInt(groupId)
        $scope.groupsErrorsWhileEditing[groupId] = false
        $scope.editing[groupId] = true
        for(var i in $scope.edited)$scope.edited[i] = false

        var params = {
            user: $scope.$parent.getAuthUserObjectFromCookies(),
            group: {
                name: $scope.groupsToEdit[groupId].name,
                money: Math.round($scope.groupsToEdit[groupId].money * 100)
            }
        }

        $http.put('/groups/' + groupId + '.json', params).
            then(function(data, status) {
                if(data.data.success) {
                    $scope.groups[groupId].name = data.data.group.name
                    $scope.groups[groupId].money = data.data.group.money
                    $scope.groupsToEdit[groupId] = Cloner.clone($scope.groups[groupId])
                    $scope.groupsToEdit[groupId].money /= 100
                    $scope.edited[groupId] = true
                    Store.updateGroups($scope.groups)
                }
                else {
                    if(data.data.error == 'group_not_found') {
                        $scope.groupsErrorsWhileEditing[groupId] = 'Error. Group not found.'
                    }
                    else {
                        var errorMessages = []
                        for(var field in data.data.error) {
                            errorMessages.push(field + ' ' + data.data.error[field].join(', '))
                        }
                        $scope.groupsErrorsWhileEditing[groupId] = 'Errors: ' + errorMessages.join('; ')
                    }
                }
            }, function(data, status) {
                console.log('Unknown error: ', data, status)
                $scope.groupsErrorsWhileEditing[groupId] = 'Error: ' + JSON.stringify(data.data.error)
            })
    }





    function joinOrLeave(type, groupId) {
        $scope.groups[groupId].error = false
        $http({
            method: (type == 'join' ? 'POST' : 'PUT'),
            url: '/groups/' + groupId + '/' + type + '.json',
            params: {user: $scope.$parent.getAuthUserObjectFromCookies()}}).
        then(function(data, status) {
            $scope.groups[groupId].is_user_in_group = (type == 'join' ? true : false)
        }, function(data, status) {
            $scope.groups[groupId].membershipError = true
            console.log('Unknown error: ', data, status)
        })
    }


    function setLastOperation(type) {
        $scope.lastOperation = type
        if(type == 'deposit') {
            $scope.lastOperationVerb = 'deposited'
        }
        else {
            $scope.lastOperationVerb = 'withdrawn'
        }
    }


    function depositOrWithdraw(type, groupId) {
        $scope.processing = true
        for(var i in $scope.groups) {
            $scope.groups[i].moneyError = false
            $scope.groups[i].moneyErrorDetailed = false
            $scope.groups[i].moneySuccess = false
        }
        var amountInCents
        if($scope.amountsToChange[type][groupId] == undefined)amountInCents = 0
        else amountInCents = Math.round(parseFloat($scope.amountsToChange[type][groupId]) * 100)

        if(amountInCents <= 0.0) {
            $scope.groups[groupId].moneyError = 'zero_or_negative_amount'
            $scope.processing = false
            return
        }
        if(type == 'deposit' && amountInCents > $scope.$parent.user.money) {
            $scope.groups[groupId].moneyError = 'not_enough_money_user'
            $scope.processing = false
            return
        }
        if(type == 'withdraw' && amountInCents > $scope.groups[groupId].money) {
            $scope.groups[groupId].moneyError = 'not_enough_money_group'
            $scope.processing = false
            return
        }

        var params = {}
        params.user = $scope.$parent.getAuthUserObjectFromCookies()
        params.user.money = amountInCents
        params.group_id = groupId
        $http({
            method: 'PUT',
            url: '/groups/' + groupId + '/' + type + '_money.json',
            params: params}).
            then(function(data, status) {
                if(data.data.success) {
                    $scope.lastOperationAmount = amountInCents
                    if(type == 'deposit') {
                        $scope.groups[groupId].money += amountInCents
                        $scope.$parent.user.money -= amountInCents
                    }
                    if(type == 'withdraw') {
                        $scope.groups[groupId].money -= amountInCents
                        $scope.$parent.user.money += amountInCents
                    }
                    $scope.groups[groupId].moneySuccess = true
                    $scope.groupsToEdit[groupId].money = $scope.groups[groupId].money / 100
                }
                else {
                    var processableErrors = ['group_not_found', 'user_not_in_group',
                        'zero_or_negative_amount', 'not_enough_money_user', 'not_enough_money_group']
                    if(processableErrors.indexOf(data.data.error) > -1) {
                        $scope.groups[groupId].moneyError = data.data.error
                    }
                    else {
                        $scope.groups[groupId].moneyError = 'unknown_error'
                        $scope.groups[groupId].moneyErrorDetailed = 'Server answered: ' + JSON.stringify(data.data.error)
                    }
                }
            }, function(data, status) {
                $scope.groups[groupId].moneyError = 'unknown_error'
                console.log('Unknown error: ', data, status)
            })
        $scope.processing = false
    }
})