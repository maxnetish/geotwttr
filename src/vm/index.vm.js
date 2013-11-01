/**
 * Created by max on 29.10.13.
 */

var tokens=require('../config/tokens');

exports.indexVm = function () {
    var self = this;
    var title = "Geo statuses";
    var googleAPiToken=tokens.google.apiToken;


    return{
        title: title,
        googleApiToken: googleAPiToken
    }
};