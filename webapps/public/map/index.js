/**
 * Created by mgordeev on 09.09.2014.
 */
'use strict';

var state = require('../router').appState,
    googleConfig = require('../../../config/google'),
    libs = require('../libs'),
    ko = libs.ko,
    Q = libs.Q,
    sizer = require('./sizer');

var gMapInstance;

var loadGoogleLibs = function (dfr) {
    var script = document.createElement('script');
    var callbackName = 'gmaps_initialize';
    var onLoad = function () {
        dfr.resolve(window.google.maps);
        delete window[callbackName];
    };

    script.type = 'text/javascript';
    window[callbackName] = onLoad;
    script.src = 'https://maps.googleapis.com/maps/api/js?callback=' + callbackName + '&key=' + googleConfig.apiKey;

    document.body.appendChild(script);
};

var promiseGoogleMaps = function () {
    var dfr = Q.defer();

    if (window.google && window.google.maps) {
        dfr.resolve(window.google.maps);
    } else {
        loadGoogleLibs(dfr);
    }

    return dfr.promise;
};

var showMap = function () {
    promiseGoogleMaps().then(function (gmaps) {
        var mapOptions = {
            zoom: ko.unwrap(state.zoom),
            center: new gmaps.LatLng(ko.unwrap(state.center).lat, ko.unwrap(state.center).lng)
        };
        sizer.bind();

        gMapInstance = new gmaps.Map(document.getElementById('gmap'), mapOptions);
    });
};

module.exports = {
    showMap: showMap,
    promiseGmaps: promiseGoogleMaps
};