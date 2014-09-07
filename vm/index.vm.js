/**
 * Created by max on 29.10.13.
 */

exports.indexVm = function () {
    var self = this,
        title = "Geo statuses",
        clientScripts = require("../config/client-script.json"),
        ipGeocode = null;
    return{
        title: title,
        clientScripts: clientScripts,
        ipGeocode: ipGeocode
    };
};