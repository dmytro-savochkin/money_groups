moneyGroupsApp.filter('monetary', function () {
    return function (amount) {
        if(amount == 'loading...')return amount
        return '$' + (amount / 100).toFixed(2)
    }
})