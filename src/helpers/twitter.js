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
    //var self = this;

    opts = opts || {};
    var _accessToken = opts.accessToken || null;
    var _filterOptions = opts.filterOptions || null;
    var _streamRequest;
    var _streamResponse;

    var _buffer = "";
    var _onError = function (error, data) {
        _eventHandlersExecutor.onRequestError(error, data);
    };

    var _eventHandlers = {
        tweetReceived: [],
        closeConnection: [],
        requestError: []
    };

    var _eventHandlersExecutor = {
        onTweetReceived: function (oneTweet) {
            _.each(_eventHandlers.tweetReceived, function (oneOnTweetReceivedCallback) {
                if (_.isFunction(oneOnTweetReceivedCallback)) {
                    oneOnTweetReceivedCallback(oneTweet);
                }
            });
        },
        onCloseConnection: function () {
            _.each(_eventHandlers.closeConnection, function (oneOnCLoseConnectionCallback) {
                if (_.isFunction(oneOnCLoseConnectionCallback)) {
                    oneOnCLoseConnectionCallback();
                }
            });
        },
        onRequestError: function (error, data) {
            _.each(_eventHandlers.requestError, function (oneOnRequestErrorCallback) {
                if (_.isFunction(oneOnRequestErrorCallback)) {
                    oneOnRequestErrorCallback(error, data);
                }
            });
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
        _eventHandlersExecutor.onTweetReceived(oneTweet);
    };
    var _onCloseConnection = function () {
        _eventHandlersExecutor.onCloseConnection();
    };
    var _startRequest = function (secret) {
        var oa = oAuthConsumer();
        var filterStreamUrl = "https://stream.twitter.com/1.1/statuses/filter.json";
        _streamRequest = oa.post(filterStreamUrl, _accessToken, secret, _filterOptions);
        _streamRequest.on("error", function (err) {
            _onError(err);
        });
        _streamRequest.on('response', function (responseLocal) {
            _streamResponse = responseLocal;
            _streamResponse.setEncoding('utf8');
            _streamResponse.on('data', function (chunk) {
                _onChunkReceived(chunk);
            });
            _streamResponse.on('close', function () {
                _onCloseConnection();
            });
        });

        //streamRequest.end();
    };
    var _addHandler = function (eventName, callback) {
        if (!_eventHandlers[eventName]) {
            _eventHandlers[eventName] = [];
        }
        _eventHandlers[eventName].push(callback);
    };
    var _removeHandler = function (eventName) {
        if (_eventHandlers[eventName]) {
            _eventHandlers[eventName] = [];
        }
    };
    var _closeConnection = function (callback) {
        var error = null;
        if (_streamResponse) {
            _streamResponse.destroy();
        } else {
            error = "Response stream not created.";
        }
        if (_streamRequest) {
            _streamRequest.end();
        } else {
            var msg = "Request not created.";
            error = error ? error + " " + msg : msg;
        }
        if (_.isFunction(callback)) {
            callback(error);
        }
    };
    /* publics */
    this.on = function (eventName, callback) {
        _addHandler(eventName, callback);
    };
    this.off = function (eventName) {
        _removeHandler(eventName);
    };
    this.end = function (callback) {
        _closeConnection(callback);
    };
    /***********/

    /* init */
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