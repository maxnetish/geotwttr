/*
 * GET home page.
 */

var vm = require('../vm/index.vm');
var twitterHelper = require('../helpers/twitter').twitter;
var tokens = require('../config/tokens');

exports.index = function (req, res) {
    var indexVm = new vm.indexVm();

    var accessToken = req.signedCookies.at;

    twitterHelper.isAccessTokenValid(accessToken, function (error, userInfo) {
        indexVm.authSuccess = !!userInfo;
        if (indexVm.authSuccess) {
            indexVm.userInfo = userInfo;
            indexVm.googleAPiToken = tokens.google.apiToken;
            res.render('index', indexVm);
        } else {
            res.render('login', indexVm);
        }
    });


};