var libs = require('../libs'),
    Q = libs.Q;

var promiseGeocode = function (request) {
    var dfr = Q.defer();

    libs.promiseGeocoder().then(function (geocoder) {
        geocoder.geocode(request, function (results, status) {
            dfr.resolve(results || []);
        });
    });

    return dfr.promise;
};

var promiseReverseGeocode = function (plainLatLng) {
    var dfr = Q.defer();

    Q.all([libs.promiseGmaps(), libs.promiseGeocoder()]).then(function (promiseResults) {
        var gmaps = promiseResults[0],
            geocoder = promiseResults[1];
        geocoder.geocode({
            latLng: new gmaps.LatLng(plainLatLng.lat, plainLatLng.lng)
        }, function (results, status) {
            dfr.resolve(results || []);
        });
    });

    return dfr.promise;
};

module.exports = {
    promiseGeocode: promiseGeocode,
    promiseReverseGeocode: promiseReverseGeocode
};