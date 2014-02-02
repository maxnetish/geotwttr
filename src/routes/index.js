/*
 * GET home page.
 */

var vm = require('../vm/index.vm');
var twitterHelper = require('../helpers/twitter').twitter;
var tokens = require('../config/tokens');
var mmdbreader = require('maxmind-db-reader');

exports.index = function (req, res) {
    var indexVm = new vm.indexVm(),
        langCode,
        accessToken;

    // extract culture code
    if (req.headers && req.headers["accept-language"]) {
        langCode = req.headers["accept-language"].split(";")[0].split(",")[0].trim();
    }
    indexVm.langCode = langCode;

    //check access token
    accessToken = req.signedCookies.at;
    twitterHelper.isAccessTokenValid(accessToken, function (error, userInfo) {
        var mmdbReaderInstance;
        indexVm.authSuccess = !!userInfo;
        if (indexVm.authSuccess) {
            indexVm.userInfo = userInfo;
            indexVm.googleAPiToken = tokens.google.apiToken;
            //find ipgeocode:
            mmdbReaderInstance = new mmdbreader("GeoLite2-City.mmdb");
            indexVm.ipGeocode = mmdbReaderInstance.getGeoData(req.ip);
            //indexVm.ipGeocode = JSON.stringify(mmdbReaderInstance.getGeoData("95.29.232.174"));
            res.render('index', indexVm);
        } else {
            res.render('login', indexVm);
        }
    });


};