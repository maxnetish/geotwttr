var libs = require('../../libs'),
    ko = libs.ko;

var knownLanguages = [
    'en', 'ru', 'it', 'es'
];

var filterPredicate = function(tweet){
    var filterValueUnwrapped = filterValue();
    if(filterValueUnwrapped){
        return tweet && tweet.lang === filterValueUnwrapped;
    }
    return true;
};

var filterValue = ko.observable().extend({
    rateLimit: {
        timeout: 500,
        method: "notifyWhenChangesStop"
    }
});

var filter = {
    knownLanguages: knownLanguages,
    predicate: filterPredicate,
    value: filterValue
};

module.exports = filter;