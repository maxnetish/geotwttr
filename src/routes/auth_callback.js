/**
 * Created by max on 29.10.13.
 */

var vm = require('../vm/index.vm'),
    store = require('../helpers/store').store,
    twitterHelper = require('../helpers/twitter').twitter,

    onAuthFailed = function (req, res) {
        var indexVm = new vm.indexVm();
        indexVm.authFailed = true;
        res.render('login', indexVm);
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
                res.cookie('at', authToken, { expires: new Date(Date.now() + 900000000), httpOnly: true, signed: true });
                store.setSecret(authToken, authTokenSecret);
                res.redirect('/');
            });
    } else {
        onAuthFailed(req, res);
    }
};