/**
 * Selection details control
 */
var libs = require('../../libs');
var services = require('../../services');
var ko = libs.ko;
var _ = libs._;

var Viewmodel = function (params) {
    var self = this,
        appState = ko.unwrap(params.appState),
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
        read: function(){
            return _.rest(ko.unwrap(this.geocoderResults)) || [];
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
                radius = selectionUnwrapped.radius;
            return radius;
        },
        owner: this,
        pure: true,
        deferEvaluation: true,
        write: function (newValue) {
            var selectionUnwrapped = ko.unwrap(appState.selection);
            appState.selection({
                lat: selectionUnwrapped.lat,
                lng: selectionUnwrapped.lng,
                radius: parseFloat(newValue)
            });
        }
    });

    this.location.subscribe(function (newLocation) {
        if (_.isEqual(lastLocation, newLocation)) {
            return;
        }

        services.geocoder.promiseReverseGeocode(newLocation).then(function (result) {
            self.geocoderResults(result);
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