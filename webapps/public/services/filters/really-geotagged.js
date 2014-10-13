var libs = require('../../libs'),
    ko = libs.ko;

var filter = function(){
    this.value = ko.observable(false).extend({
        rateLimit: {
            timeout: 500,
            method: "notifyWhenChangesStop"
        }
    });
};

filter.prototype.predicate = function(tweet){
    return true;
};

module.exports = filter;
