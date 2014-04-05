/**
 * Created by Gordeev on 01.02.14.
 */
define(["cookies"], function (docCookies) {
    var debug = true,
        ipGeocode = null,
        coordinatesKey = "coord",
        newStatusesPollInterval = 60 * 1000,
        setCoord = function (coord) {
            docCookies.setItem(coordinatesKey, JSON.stringify(coord), Infinity);
        },
        getCoord = function () {
            var result = null;
            try {
                result = JSON.parse(docCookies.getItem(coordinatesKey));
            }
            catch (err) {
                docCookies.removeItem(coordinatesKey);
                result = null;
            }
            return result;
        },
        coordinates = function (coord) {
            if (coord && coord.lat && coord.lng) {
                setCoord(coord);
                return coord;
            } else {
                return getCoord();
            }
        };

    return{
        debug: debug,
        ipGeocode: ipGeocode,
        coordinates: coordinates,
        newStatusesPollInterval: newStatusesPollInterval
    };
});