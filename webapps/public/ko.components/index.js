var ko = require('../libs').ko;

var rootViewModel = function(){
    var selectedGeosearchResult = ko.observable();
    var mapInstance = ko.observable();
    var selectionGeocode = ko.observable([]);
    var appState = require('../router').appState;

    return {
        selectedGeosearchResult: selectedGeosearchResult,
        mapInstance: mapInstance,
        appState: appState,
        selectionGeocode: selectionGeocode
    };
};

module.exports = {
    registerComponents: function(){
        require('./map').register();
        require('./geosearch-result-item').register();
        require('./geosearch-control').register();
        require('./selection-details').register();
    },
    registerApp: function(domRoot){
        ko.applyBindings(rootViewModel(), domRoot);
    }
};
