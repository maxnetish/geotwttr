var ko = require('../libs').ko;

var rootViewModel = function(){
    var selectedGeosearchResult = ko.observable();
    var mapInstance = ko.observable();
    var selectionGeocode = ko.observable([]);
    var appState = require('../router').appState;
    var filterSettingsVisible = ko.observable(false);
    var toggleFilterSettings = function(){
        filterSettingsVisible(!filterSettingsVisible());
    };

    return {
        selectedGeosearchResult: selectedGeosearchResult,
        mapInstance: mapInstance,
        appState: appState,
        selectionGeocode: selectionGeocode,
        filterSettingsVisible: filterSettingsVisible,
        toggleFilterSettings: toggleFilterSettings
    };
};

module.exports = {
    registerComponents: function(){
        require('./map').register();
        require('./geosearch-result-item').register();
        require('./geosearch-control').register();
        require('./selection-details').register();
        require('./filter-settings-panel').register();
    },
    registerApp: function(domRoot){
        ko.applyBindings(rootViewModel(), domRoot);
    }
};
