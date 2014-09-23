/**
 * Created by Gordeev on 21.09.2014.
 */

var libs = require('../libs');
var Q = libs.Q;
var ko = libs.ko;
var $ = libs.$;
var _ = libs._;

var GeosearchViewModel = function(params, componentInfo){
    var self = this,
        $element = $(componentInfo.element);

    var geocoderInstance;

    var onSearchTextUpdate = function (newText) {
        var thisContext = self,
            $dropdown = $('.geo-autocomplete-dropdown', $element),
            $dropdownWrapper = $('.geo-autocomplete-dropdown-wrapper', $element);

        if(!newText){
            $dropdown.removeClass('expanded');
            _.delay(function(){
                // we need delay to show css animation
                $dropdownWrapper.removeClass('expanded');
                thisContext.searchResults.removeAll();
            }, 500);
            return;
        }

        $dropdownWrapper.addClass('expanded');
        _.defer(function(){
            // we need defer to show css animation
            $dropdown.addClass('expanded');
        });

        thisContext.promiseGeocoderInstance().then(function (geocoder) {
            geocoder.geocode({
                address: newText
            }, function (geoResults, status) {
                console.dir(geoResults);
                thisContext.searchResults(geoResults);
            });
        });
    };

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
            var foo = libs.promiseGmaps();
            foo.then(function (gmaps) {
                geocoderInstance = new gmaps.Geocoder();
                dfr.resolve(geocoderInstance);
            });
        }
        return dfr.promise;
    };

    this.searchText.subscribe(onSearchTextUpdate, this);
};

var createGeosearchViewModel = function (params, componentInfo) {
    return new GeosearchViewModel(params, componentInfo);
};

var register = function () {
    ko.components.register('geosearch-control', {
        template: {
            element: 'geosearch-control'
        },
        viewModel: {
            createViewModel: createGeosearchViewModel
        }
    });
};

module.exports = {
    register: register
};