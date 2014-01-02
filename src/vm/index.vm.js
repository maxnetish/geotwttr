/**
 * Created by max on 29.10.13.
 */

exports.indexVm = function () {
    var self = this;
    var title = "Geo statuses";
    var clientScripts = require("../config/client-script.json");
    return{
        title: title,
        clientScripts: clientScripts
    };
};