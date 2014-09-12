/**
 * Created by mgordeev on 10.09.2014.
 */

// depends
var googleConfig = require('../../../config/google'),
    libs = require('../libs'),
    Q = libs.Q;

var callbackName = 'gmaps_initialize',

    onLibLoaded = function (gmap, dfr, callback) {
        if (callback) {
            callback(gmap);
        }
        dfr.resolve(gmap);
    },

    beginLoadGoogleLibs = function (dfr, callback) {
        var script;

        window[callbackName] = function () {
            onLibLoaded(window.google.maps, dfr, callback);
            delete window[callbackName];
        };

        script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = 'https://maps.googleapis.com/maps/api/js?callback=' + callbackName + '&key=' + googleConfig.apiKey;

        document.body.appendChild(script);
    },

    getGoogleMaps = function (callback) {
        var dfr = Q.defer();

        if (window.google && window.google.maps) {
            onLibLoaded(window.google.maps, dfr, callback);
        } else {
            beginLoadGoogleLibs(dfr, callback);
        }

        return dfr.promise;
    };

module.exports = {
    /**
     * returns google.maps namespace via callback or promise
     */
    getGMaps: getGoogleMaps
};
