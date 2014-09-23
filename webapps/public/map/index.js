/**
 * Created by mgordeev on 09.09.2014.
 */
'use strict';

var state = require('../router').appState,
    libs = require('../libs'),
    ko = libs.ko,
    Q = libs.Q,
    $ = libs.$,
    sizer = require('./sizer'),
    mapState = require('./map-state'),
    mapSelection = require('./selection'),
    homeLocation = require('./home-location');

var getGMaps = function () {
    return libs.promiseGmaps();
};

var createMapIn = function (domContainer) {
    var dfr = Q.defer(), map;
    getGMaps().then(function (gmaps) {
        var homeCoords = homeLocation.getDefaultLocation(),
            mapOptions;

        // correct state using real location (default or ip)
        state.center({
            lat: homeCoords.latitude,
            lng: homeCoords.longitude
        });

        mapOptions = {
            zoom: ko.unwrap(state.zoom),
            center: new gmaps.LatLng(ko.unwrap(state.center).lat, ko.unwrap(state.center).lng),
            streetViewControl: false
        };
        sizer.bind(domContainer, function () {
            if (map) {
                gmaps.event.trigger(map, 'resize');
            }
        });
        map = new gmaps.Map(domContainer, mapOptions);
        mapSelection.init(gmaps, map);
        mapState.bind(gmaps, map, state);
        dfr.resolve(map);
    });
    return dfr.promise;
};

module.exports = {
    createMapIn: createMapIn,
    promiseGMaps: getGMaps
};