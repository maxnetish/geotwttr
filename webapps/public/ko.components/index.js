var ko = require('../libs').ko;

var rootViewModel = function(){

    return {

    };
};

module.exports = {
    registerComponents: function(){
        require('./geosearch-result-item').register();
        require('./geosearch-control').register();
    },
    registerApp: function(domRoot){
        ko.applyBindings(rootViewModel(), domRoot);
    }
};
