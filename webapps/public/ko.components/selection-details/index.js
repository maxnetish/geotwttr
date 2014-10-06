/**
 * Selection details control
 */
var libs = require('../../libs');
var services = require('../../services');
var ko = libs.ko;
var _ = libs._;
var addressParser = require('./address-parser');

var Viewmodel = function (params) {
    var self = this,
        appState = ko.unwrap(params.appState),
        mapInstanceWrapped = params.mapInstance,
        lastLocation = {
            lat: null,
            lng: null
        };

    this.expanded = ko.observable(false);
    this.geocoderResults = ko.observableArray();
    this.geocoderFirstResult = ko.computed({
        read: function () {
            return _.first(ko.unwrap(this.geocoderResults));
        },
        owner: this,
        pure: true,
        deferEvaluation: true
    });
    this.geocoderRestResult = ko.computed({
        read: function () {
            var expandedUnwrapped = ko.unwrap(this.expanded);
            if (expandedUnwrapped) {
                return _.rest(ko.unwrap(this.geocoderResults)) || [];
            }
            return [];
        },
        owner: this,
        pure: true,
        deferEvaluation: true
    });
    this.location = ko.computed({
        read: function () {
            var selectionUnwrapped = ko.unwrap(appState.selection);
            return {
                lat: selectionUnwrapped.lat,
                lng: selectionUnwrapped.lng
            };
        },
        owner: this,
        pure: true,
        deferEvaluation: true
    });
    this.radius = ko.computed({
        read: function () {
            var selectionUnwrapped = ko.unwrap(appState.selection),
                radius = selectionUnwrapped.radius.toFixed(0);
            return radius;
        },
        owner: this,
        pure: true,
        deferEvaluation: true,
        write: function (newValue) {
            var newValueNum = parseFloat(newValue),
                selectionUnwrapped;
            if (isNaN(newValueNum) || !newValueNum || newValueNum < 0) {
                return;
            }
            selectionUnwrapped = ko.unwrap(appState.selection);
            appState.selection({
                lat: selectionUnwrapped.lat,
                lng: selectionUnwrapped.lng,
                radius: newValueNum
            });
        }
    });

    this.positionTo = function (searchResult) {
        var map = ko.unwrap(mapInstanceWrapped);
        if (!(map && searchResult && searchResult.geometry)) {
            return;
        }
        map.fitBounds(searchResult.geometry.viewport);
    };

    this.location.subscribe(function (newLocation) {
        if (_.isEqual(lastLocation, newLocation)) {
            return;
        }
        lastLocation = _.clone(newLocation);
        services.geocoder.promiseReverseGeocode(newLocation).then(function (result) {
            _.each(result, function (resultItem) {
                resultItem.parsedAddress = addressParser.parse(resultItem);
            });
            if (!result || result.length === 0) {
                result.push({
                    parsedAddress: 'lat:' + newLocation.lat + ' lng:' + newLocation.lng
                });
            }
            self.geocoderResults(result);
            console.log(result);
        });
    });
};

var createViewModel = function (params, componentInfo) {

    return new Viewmodel(params);
};

var register = function () {
    ko.components.register('selection-details-control', {
        template: {
            element: 'selection-details-tpl'
        },
        viewModel: {
            createViewModel: createViewModel
        }
    });
};

Viewmodel.prototype.expandToggle = function () {
    this.expanded(!this.expanded());
};

module.exports = {
    register: register
};
