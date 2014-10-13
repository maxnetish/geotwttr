var libs = require('../../libs'),
    ko = libs.ko;

var filter = function(){
    this.value = ko.observable().extend({
        rateLimit: {
            timeout: 500,
            method: "notifyWhenChangesStop"
        }
    });
};

filter.prototype.predicate = function(tweet){
    return true;
};

filter.prototype.knownLanguages = [
    'en', 'ru', 'it', 'es'
];

module.exports = filter;