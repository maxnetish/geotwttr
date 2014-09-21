/**
 * Created by Gordeev on 21.09.2014.
 */
var libs = require('../libs'),
    ko = libs.ko;

var controlViewModel = function (gmaps) {
    var searchResults = ko.observableArray();
    var searchText = ko.observable();
    var geocodeInstance = new gmaps.Geocoder();

    var onSearchTextUpdate = function (newText) {
        geocodeInstance.geocode({
            address: newText
        }, function (geoResults, status) {
            console.dir(geoResults);
            searchResults(geoResults);
        });
    };

    searchText.subscribe(onSearchTextUpdate);

    return {
        searchText: searchText,
        searchResults: searchResults
    };
};

var bind = function (domContainer, gmaps) {
    ko.applyBindings(controlViewModel(gmaps), domContainer);
};

ko.components.register('geosearch-result-item', {
    template: {
        element: 'geosearch-result-item'
    }
});

module.exports = {
    bind: bind
};