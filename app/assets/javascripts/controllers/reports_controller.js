moneyGroupsApp.controller('reportsController', function($scope, $http, $cookies, Store) {
    $scope.users = {}
    $scope.groups = {}
    $scope.groupToMakeReportFor = undefined
    $scope.userToMakeReportFor = undefined
    $scope.reportShown = false
    $scope.errors = {
        groups: undefined,
        users: undefined,
        total: undefined
    }
    clearAllReports()

    $scope.$watch(function() { return Store.getData().groups },
        function(value) {
            if(!jQuery.isEmptyObject(value))
                $scope.groups = Store.getData().groups
        }
    )
    $scope.$watch(function() { return Store.getData().users },
        function(value) {
            if(!jQuery.isEmptyObject(value))
                $scope.users = Store.getData().users
        }
    )




    //get "/users/:user_id/report" => "users#report"
    //get "/groups/:group_id/report" => "groups#report"
    //get "/actions/report" => "actions#report"

    $scope.newReportByUser = function() {
        if($scope.userToMakeReportFor) {
            newReportByGroupOrUser('user', $scope.userToMakeReportFor)
            $scope.reportShown = 'user'

        }
    }

    $scope.newReportByGroup = function() {
        if($scope.groupToMakeReportFor) {
            newReportByGroupOrUser('group', $scope.groupToMakeReportFor)
            $scope.reportShown = 'group'
        }
    }

    $scope.newTotalReport = function() {
        newReportByGroupOrUser('total')
        $scope.reportShown = 'total'
    }




    function newReportByGroupOrUser(type, id) {
        $scope.errors.groups = undefined
        $scope.errors.users = undefined
        clearAllReports()
        var id = parseInt(id)
        var url, objectName
        if(type == 'total') {
            url = '/actions/report.json'
            objectName = type
        }
        else {
            url = '/' + type + 's/' + id + '/report.json'
            objectName = type + 's'
        }

        $http.get(url, {params: {user: $scope.$parent.getAuthUserObjectFromCookies()}}).
            then(function(data, status) {
                if(data.data.success) {
                    $scope.reports[objectName] = data.data.actions
                }
                else {
                    $scope.errors[objectName] = data.data.error
                }
            }, function(data, status) {
                $scope.errors[objectName] = 'Unknown error: ' + data.data
                console.log('Unknown error: ', data, status)
            })
        $scope.reportShown = type
    }

    function clearAllReports() {
        $scope.reports = {
            groups: undefined,
            users: undefined,
            total: undefined
        }
    }

})