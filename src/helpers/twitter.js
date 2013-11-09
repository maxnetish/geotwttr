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

var performStatusesFilterStream = function (accessToken, filterOptions, callback) {
    var buffer = "";
    var nextTweetLength;
    var onError = function (error, data) {
        if (callback) callback(error, data);
    };
    var onChunkReceived=function(chunk){
        buffer+=chunk.toString();
        var rnPosition=buffer.indexOf("\r\n");
        var holeTweet;
        while(rnPosition!=-1){
            holeTweet=buffer.substring(0,rnPosition);
            buffer=buffer.substring(rnPosition);
            if(holeTweet.length){
                onTweetReceived(holeTweet);
            }
            rnPosition=buffer.indexOf("\r\n");
        }
    };
    var onTweetReceived=function(oneTweet){
        if(callback){
            callback(null, oneTweet);
        }
    };
    var onClose=function(response){
        if(callback){
            callback(null,null);
        }
    };
    store.getSecret(accessToken, function (error, secret) {
        if (error) {
            onError(error);
            return;
        }
        var oa = oAuthConsumer();
        var filterStreamUrl = "https://stream.twitter.com/1.1/statuses/filter.json";
        var streamRequest = oa.post(filterStreamUrl, accessToken, secret, filterOptions);

        streamRequest.on('response', function (response) {
            response.setEncoding('utf8');
            response.on('data', function (chunk) {
                onChunkReceived(chunk);
            });
            response.on('close', function () {
                onClose(response);
            });
        });
        streamRequest.on("error", function (err) {
            onError(err);
        });
        streamRequest.end();
    });
};

exports.twitter = {
    isAccessTokenValid: verifyCredentials,
    getAccessToken: getAccessToken,
    getRequestToken: getRequestToken,
    searchTweets: searchTweets
};