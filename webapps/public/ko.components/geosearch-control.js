/**
 * Created by Gordeev on 21.09.2014.
 */

var Q = require('../libs').Q;
var ko = require('../libs').ko;
var map = require('../map');

var GeosearchViewModel = function (params) {
    var self = this;

    var geocoderInstance;

    this.searchResults = ko.observableArray();
    this.searchText = ko.observable().extend({
        rateLimit: {
            timeout: 500,
            method: "notifyWhenChangesStop"
        }
    });
    this.promiseGeocoderInstance = function () {
        var dfr = Q.defer();

        if (geocoderInstance) {
            dfr.resolve(geocoderInstance);
        } else {
            map.promiseGMaps().then(function (gmaps) {
                geocoderInstance = new gmaps.Geocoder();
                dfr.resolve(geocoderInstance);
            });
        }
        return dfr.promise;
    };

    this.searchText.subscribe(this.onSearchTextUpdate, this);
};

GeosearchViewModel.prototype.onSearchTextUpdate = function (newText) {
    var thisContext = this;
    thisContext.promiseGeocoderInstance().then(function (geocoder) {
        geocoder.geocode({
            address: newText
        }, function (geoResults, status) {
            console.dir(geoResults);
            thisContext.searchResults(geoResults);
        });
    });
};

var register = function () {
    ko.components.register('geosearch-control', {
        template: {
            element: 'geosearch-control'
        },
        viewModel: GeosearchViewModel
    });
};

module.exports = {
    register: register
};