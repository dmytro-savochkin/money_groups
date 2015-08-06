moneyGroupsApp.factory("Cloner", function() {
    return {
        clone: function(object) {
            return angular.fromJson(angular.toJson(object))
        }
    };
});