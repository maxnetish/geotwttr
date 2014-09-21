/**
 * Created by mgordeev on 10.09.2014.
 */

// depends
var googleConfig = require('../../../config/google'),
    libs = require('../libs'),
    Q = libs.Q;

var gMapsDefer = Q.defer();

var callbackName = 'gmaps_initialize',

    beginLoadGoogleLibs = function () {
        var script;

        window[callbackName] = function () {
            gMapsDefer.resolve(window.google.maps);
            delete window[callbackName];
        };

        script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = 'https://maps.googleapis.com/maps/api/js?callback=' + callbackName + '&key=' + googleConfig.apiKey;

        document.body.appendChild(script);
    },

    getGoogleMaps = function () {

        if (!(window.google && window.google.maps) && !window[callbackName]) {
            beginLoadGoogleLibs();
        }

        return gMapsDefer.promise;
    };

module.exports = {
    /**
     * returns google.maps namespace via callback or promise
     */
    promiseGMaps: getGoogleMaps
};
