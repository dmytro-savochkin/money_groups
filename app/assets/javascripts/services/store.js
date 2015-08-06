moneyGroupsApp.factory("Store", function() {
    var data = {
        groups: {},
        users: {}
    }

    return {
        updateGroups: function(groups) {
            data.groups = {}
            for(var i in groups)
                data.groups[groups[i].id] = groups[i].name
        },
        updateUsers: function(users) {
            data.users = {}
            for(var i in users)
                data.users[users[i].id] = users[i].name
        },
        getData: function() {
            return data
        }
    };
});