/**
 * Created by mgordeev on 09.09.2014.
 */
'use strict';

var state = require('../router').appState,
    libs = require('../libs'),
    ko = libs.ko,
    Q = libs.Q,
    sizer = require('./sizer'),
    libLoader = require('./loader'),
    mapState = require('./map-state'),
    mapSelection = require('./selection');


var getGMaps = function(callback){
    return libLoader.getGMaps(callback);
};

var createMapIn = function (domContainer) {
    var dfr = Q.defer(), map;
    getGMaps().then(function (gmaps) {
        var mapOptions = {
            zoom: ko.unwrap(state.zoom),
            center: new gmaps.LatLng(ko.unwrap(state.center).lat, ko.unwrap(state.center).lng)
        };
        sizer.bind();
        map = new gmaps.Map(domContainer, mapOptions);
        mapSelection.init(gmaps, map);
        mapState.bind(gmaps, map, state);
        dfr.resolve(mapInstance);
    });
    return dfr;
};

module.exports = {
    createMapIn: createMapIn,
    getGMaps: getGMaps
};