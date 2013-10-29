/**
 * Created by max on 29.10.13.
 */

var vm = require('../vm/index.vm');
var store = require('../helpers/store').store;
var twitterHelper=require('../helpers/twitter').twitter;

var onAuthFailed = function (req, res) {
    indexVm = new vm.indexVm();
    indexVm.authFailed = true;
    res.render('index', indexVm);
};

exports.redirectFromAuth = function (req, res) {
    if (req.query.denied) {
        onAuthFailed(req, res);
        return;
    }
    if (req.query.oauth_token && req.query.oauth_verifier) {
        twitterHelper.getAccessToken(req.query.oauth_token,
            req.query.oauth_token_secret,
            req.query.oauth_verifier,
            function (error, authToken, authTokenSecret) {
                if (error) {
                    onAuthFailed(req, res);
                    return;
                }
                res.cookie('at', authToken, { expires: new Date(Date.now() + 90000000), httpOnly: true, signed: true });
                store.setSecret(authToken, authTokenSecret);
                res.redirect('/');
            });
    } else {
        onAuthFailed(req, res);
    }
};