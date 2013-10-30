/**
 * Created by max on 29.10.13.
 */

var store = require('./store').store;
var OAuth = require('oauth').OAuth;
var tokens = require('../config/tokens');
var url = require('url');

var oAuthConsumer = function () {
    return  new OAuth("https://api.twitter.com/oauth/request_token",
        "https://api.twitter.com/oauth/access_token",
        tokens.twitter.consumerKey,
        tokens.twitter.consumerSecret,
        "1.0A",
        null,
        "HMAC-SHA1");
};

var getRequestToken = function (callback) {
    var oa = oAuthConsumer();
    oa.getOAuthRequestToken(null, callback);
};

var getAccessToken = function (requestToken, tokenSecret, requestVerifier, callback) {
    var oa = oAuthConsumer();
    oa.getOAuthAccessToken(requestToken, tokenSecret, requestVerifier, callback);
};

var verifyCredentials = function (accessToken, callback) {
    store.getSecret(accessToken, function (error, secret) {
        if (error) {
            callback(error);
            return;
        }
        var oa = oAuthConsumer();
        oa.get("https://api.twitter.com/1.1/account/verify_credentials.json?skip_status=1", accessToken, secret, function (error, result) {
            if (error) {
                callback(error);
                return;
            }
            var accountInfo = JSON.parse(result);
            callback(null, accountInfo);
        });
    });
};

var searchTweets = function (accessToken, searchOptions, callback) {
    store.getSecret(accessToken, function (error, secret) {
        if (error) {
            callback(error);
            return;
        }
        var oa = oAuthConsumer();
        var searchUrl = url.parse("https://api.twitter.com/1.1/search/tweets.json");
        searchUrl.query = searchOptions;
        var actualUnwrapped = url.format(searchUrl);
        oa.get(actualUnwrapped, accessToken, secret, function (error, result) {
            if (error) {
                callback(error);
                return;
            }
            var resultParsed = JSON.parse(result);
            callback(null, resultParsed);
        });
    });
};

exports.twitter = {
    isAccessTokenValid: verifyCredentials,
    getAccessToken: getAccessToken,
    getRequestToken: getRequestToken,
    searchTweets: searchTweets
};