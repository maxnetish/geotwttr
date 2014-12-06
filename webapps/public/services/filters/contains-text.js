var libs = require('../../libs'),
    ko = libs.ko;

var filterValue = ko.observable().extend({
    rateLimit: {
        timeout: 500,
        method: "notifyWhenChangesStop"
    }
});
var filterPredicate = function (tweet) {
    var filterValueUnwrapped = filterValue();
    if (filterValueUnwrapped && tweet.text) {
        return String.prototype.indexOf.call(tweet.text.toUpperCase(), filterValueUnwrapped.toUpperCase()) !== -1;
    }
    return true;
};

var filter = {
    predicate: filterPredicate,
    value: filterValue
};

module.exports = filter;