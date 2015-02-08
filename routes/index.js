/*
 * GET home page.
 */

var express = require('express');
var router = express.Router();
var store = require('../helpers/store').store;
var twitterAuthService = require('../services/twitter/auth');
var Vm = require('../services/vm');
var Q = require('q');

router.get('/', function (req, res) {
    var vm = new Vm(req.query),
        accessToken,
        deferreds = [];

    vm.setLangCode(req.langCode);

    //get access token from cookie
    accessToken = req.signedCookies.at;

    if (!accessToken) {
        // no access token - show login page
        return res.render('login', vm);
    }

    // prepare to exec deferreds to build vm
    deferreds.push(twitterAuthService.verifyCredentials(accessToken));
    deferreds.push(vm.promiseSetIpGeocode(req.ip));

    // wait while deferreds done...
    Q.all(deferreds).then(function (allResult) {
        var userInfo = allResult[0],
            vmFilled = allResult[1];
        if (userInfo) {
            vmFilled.setUserInfo(userInfo).setGoogleAPiToken();
            vmFilled.prerendered = require('../webapps/public/components/index.jsx').renderInNode({
                userInfo: vmFilled.userInfo,
                title: vmFilled.title,
                langCode: vmFilled.langCode
            });
            return res.render('index', vmFilled);

        }
        // no user info - show login page with message
        vm.setAuthError('Something wrong... when get account info from twitter. Try again.');
        return res.render('login', vm);
    }).then(null, function (err) {
        // err in auth stack:
        vm.setAuthError(err.message);
        return res.render('login', vm);
    });
});

router.get('/logout', function (req, res) {
    res.cookie('at', null, {expires: new Date(Date.now() - 90000000), httpOnly: true, signed: true});
    res.redirect('/');
});

router.get('/auth', function (req, res, next) {
    twitterAuthService.getRequestToken().then(function (result) {
        if (!result.result.oauth_callback_confirmed) {
            var vm = new Vm();
            vm.setAuthError('Not confirmed.');
            return res.render('login', vm);
        }
        return res.redirect("https://api.twitter.com/oauth/authenticate?oauth_token=" + result.requestToken);
    }).then(null, next);
});

router.get('/auth_callback', function (req, res, next) {
    var vm = new Vm();

    if (req.query.denied) {
        vm.setAuthError('Access denied');
        return res.render('login', vm);
    }

    if (req.query.oauth_token && req.query.oauth_verifier) {
        twitterAuthService.getAccessToken(req.query.oauth_token, req.query.oauth_token_secret, req.query.oauth_verifier)
            .then(function (result) {
                res.cookie('at', result.authToken, {
                    expires: new Date(Date.now() + 900000000),
                    httpOnly: true,
                    signed: true
                });
                store.setSecret(result.authToken, result.authTokenSecret);
                console.log('We receive accessToken: ' + result.authToken + ', secret: ' + result.authTokenSecret);
                return res.redirect('/');
            }).then(null, function (err) {
                vm.setAuthError(err.message);
                return res.render('login', vm);
            });
    } else {
        vm.setAuthError('Something wrong... when get security tokens from twitter. Try again.');
        return res.render('login', vm);
    }
});

module.exports = router;
