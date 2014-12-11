/**
 * Created by mgordeev on 09.09.2014.
 */
'use strict';

var
//    state = require('../router').appState,
    libs = require('../../libs'),
    ko = libs.ko,
    Q = libs.Q,
    $ = libs.$,
    sizer = require('./sizer'),
    mapState = require('./map-state'),
    mapSelection = require('./selection'),
    homeLocation = require('./home-location'),
    selectedTweetPlace = require('./selected-tweet-place');


var getGMaps = function () {
    return libs.promiseGmaps();
};

var createMapIn = function (domContainer, state, selectedTweet) {
    var dfr = Q.defer(), map;
    getGMaps().then(function (gmaps) {
        var homeCoords = homeLocation.getDefaultLocation(),
            mapOptions;

        // correct state using real location (default or ip)
        // (if it is not restored from storage - router/state.js)
        if(!state.center().lat && !state.center().lng) {
            state.center({
                lat: homeCoords.latitude,
                lng: homeCoords.longitude
            });
        }

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
        selectedTweetPlace.init(map, gmaps, selectedTweet);
        dfr.resolve(map);
    });
    return dfr.promise;
};

var createViewModel = function (params, componentInfo) {
    createMapIn($('#gmap', componentInfo.element).get(0), params.appState, params.selectedTweet)
        .then(function (createdMap) {
            params.mapInstance(createdMap);
        });

};

var register = function () {
    ko.components.register('gmap-control', {
        template: '<div id="gmap" class="gmap"></div>',
        viewModel: {
            createViewModel: createViewModel
        }
    });
};

module.exports = {
    register: register
};