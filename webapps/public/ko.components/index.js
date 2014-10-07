var ko = require('../libs').ko;

var rootViewModel = function(){
    var selectedGeosearchResult = ko.observable();
    var mapInstance = ko.observable();
    var selectionGeocode = ko.observable([]);
    var appState = require('../router').appState;
    var settingsVisible = ko.observable(false);
    var toggleSettings = function(){
        settingsVisible(!settingsVisible());
    };

    return {
        selectedGeosearchResult: selectedGeosearchResult,
        mapInstance: mapInstance,
        appState: appState,
        selectionGeocode: selectionGeocode,
        settingsVisible: settingsVisible,
        toggleSettings: toggleSettings
    };
};

module.exports = {
    registerComponents: function(){
        require('./map').register();
        require('./geosearch-result-item').register();
        require('./geosearch-control').register();
        require('./selection-details').register();
        require('./settings-panel').register();
    },
    registerApp: function(domRoot){
        ko.applyBindings(rootViewModel(), domRoot);
    }
};
