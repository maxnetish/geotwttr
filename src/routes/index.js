/*
 * GET home page.
 */

var vm = require('../vm/index.vm');
var twitterHelper = require('../helpers/twitter').twitter;

exports.index = function (req, res) {
    var indexVm = new vm.indexVm();

    var accessToken = req.signedCookies.at;

    twitterHelper.isAccessTokenValid(accessToken, function (error, userInfo) {
        indexVm.authSuccess = !!userInfo;
        indexVm.userInfo = userInfo;
        res.render('index', indexVm);
    });


};