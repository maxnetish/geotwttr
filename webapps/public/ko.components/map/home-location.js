var libs = require('../../libs'),
    Q = libs.Q;

var geoApiAvailable = ('geolocation' in navigator),
    ipGeolocation,
    defaultLocation = {
        // google office Mountain View
        latitude: 37.419,
        longitude: -122.080
    };

var getDefaultLocation = function(){
    return ipGeolocation || defaultLocation;
};

var promiseHomeLocation = function () {
    var dfr = Q.defer(),
        result;

    if (geoApiAvailable) {
        window.navigator.geolocation.getCurrentPosition(function (apiLocation) {
            result = {
                latitude: apiLocation.coords.latitude,
                longitude: apiLocation.coords.longitude
            };
            dfr.resolve(result);
        }, function (err) {
            result = getDefaultLocation();
            dfr.resolve(result);
        }, {
            enableHighAccuracy: true,
            timeout: 2000
        });
    } else {
        result = getDefaultLocation();
        dfr.resolve(result);
    }
    return dfr.promise;
};

if (window.gt_config && window.gt_config.ipGeolocation) {
    ipGeolocation = window.gt_config.ipGeolocation.location;
}

module.exports = {
    geoApiAvailable: geoApiAvailable,
    /**
     * with browser geo api
     */
    promiseHomeLocation: promiseHomeLocation,
    getDefaultLocation: getDefaultLocation
};