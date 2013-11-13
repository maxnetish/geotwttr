/**
 * Created by max on 29.10.13.
 */

var store = require('./store').store;
var OAuth = require('oauth').OAuth;
var tokens = require('../config/tokens');
var url = require('url');
var _ = require('underscrore');

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

var performStatusesFilterStream = function (opts) {
    var self = this;

    opts = opts || {};
    var _accessToken = opts.accessToken || null;
    var _filterOptions = opts.filterOptions || null;

    var _buffer = "";
    var _onError = function (error, data) {

    };

    var _eventHandlers={
        tweetReceived: [],
        closeConnection: []
    };

    var _eventHandlersExecutor={
        onTweetTeceived: function(oneTweet){

            for(var i=0;i<_eventHandlers.length;i++){
                _eventHandlers.tweetReceived[i](oneTweet);
            }
        }
    };

    var _onChunkReceived = function (chunk) {
        _buffer += chunk.toString();
        var rnPosition = _buffer.indexOf("\r\n");
        var holeTweet;
        while (rnPosition !== -1) {
            holeTweet = _buffer.substring(0, rnPosition);
            _buffer = _buffer.substring(rnPosition);
            if (holeTweet.length) {
                _onTweetReceived(holeTweet);
            }
            rnPosition = _buffer.indexOf("\r\n");
        }
    };
    var _onTweetReceived = function (oneTweet) {

    };
    var _onCloseConnection = function (response) {

    };
    var _startRequest = function (secret) {
        var oa = oAuthConsumer();
        var filterStreamUrl = "https://stream.twitter.com/1.1/statuses/filter.json";
        var streamRequest = oa.post(filterStreamUrl, _accessToken, secret, _filterOptions);

        streamRequest.on('response', function (response) {
            response.setEncoding('utf8');
            response.on('data', function (chunk) {
                _onChunkReceived(chunk);
            });
            response.on('close', function () {
                _onCloseConnection(response);
            });
        });
        streamRequest.on("error", function (err) {
            _onError(err);
        });
        streamRequest.end();
    };
    var _addHandler=function(eventName, callback){

    };
    store.getSecret(_accessToken, function (error, secret) {
        if (error) {
            _onError(error);
            return;
        }
        _startRequest(secret);
    });
};

exports.twitter = {
    isAccessTokenValid: verifyCredentials,
    getAccessToken: getAccessToken,
    getRequestToken: getRequestToken,
    searchTweets: searchTweets,
    statusesFilterStream: performStatusesFilterStream
};