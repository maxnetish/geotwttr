var libs = require('../../libs'),
    ko = libs.ko;

var filter  = {
    predicate: function(tweet){
        return true;
    },
    value: ko.observable(false).extend({
        rateLimit: {
            timeout: 500,
            method: "notifyWhenChangesStop"
        }
    })
};

module.exports = filter;
