/**
 * Created by mgordeev on 10.09.2014.
 */

// depends
var
    googleConfig = require('../../config/google.json'),
    Q = require('q');
//var googleConfig = {};

var gMapsDefer,
    geocoderDefer,
    geocoderInstance;

var callbackName = 'gmaps_initialize',

    beginLoadGoogleLibs = function () {
        var script,
        //langCode =  window.gt_config && window.gt_config.langCode
            langCode = 'ru'
            ;

        window[callbackName] = function () {
            gMapsDefer.resolve(window.google.maps);
            delete window[callbackName];
        };

        script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = 'https://maps.googleapis.com/maps/api/js?callback=' + callbackName + '&key=' + googleConfig.apiKey + '&language=' + langCode;

        document.body.appendChild(script);
    },

    getGoogleMaps = function () {
        if (!gMapsDefer) {
            gMapsDefer = Q.defer();
        }

        if (!(window.google && window.google.maps) && !window[callbackName]) {
            beginLoadGoogleLibs();
        }

        return gMapsDefer.promise;
    },
    getGoogleGeocoder = function () {
        if (!geocoderDefer) {
            geocoderDefer = Q.defer();
        }

        if (!geocoderInstance) {
            getGoogleMaps().then(function (gmaps) {
                geocoderInstance = new gmaps.Geocoder();
                geocoderDefer.resolve(geocoderInstance);
            });
        }

        return geocoderDefer.promise;
    };

module.exports = {
    /**
     * returns google.maps namespace via callback or promise
     */
    getPromiseGMaps: getGoogleMaps,
    getPromiseGeocoder: getGoogleGeocoder
};
