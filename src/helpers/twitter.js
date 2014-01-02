/**
 * Created by max on 29.10.13.
 */

var store = require('./store').store;
var OAuth = require('oauth').OAuth;
var tokens = require('../config/tokens');
var url = require('url');
var _ = require('underscore');
var querystring = require('querystring');

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

var performProxyTwitterRequest = function (opts) {
    opts = opts || {};

    var _accessToken = opts.accessToken || null,
        _requestUrl = opts.requestUrl || "",
        _requestMethod = opts.requestMethod || "GET",
        _requestParams = opts.requestParams || null,
        _requestIsStream = opts.requestStream || false,
        _requestId = opts.requestId || null,
        _eventHandlers = {
            tweetReceived: [],
            closeConnection: [],
            requestError: []
        },
        _buffer = "",
        _streamResponse,
        _streamRequest,
        _eventHandlersExecutor = {
            onTweetReceived: function (oneTweet) {
                var sendBody = {
                    requestId: _requestId,
                    tweet: oneTweet
                };
                _.each(_eventHandlers.tweetReceived, function (oneOnTweetReceivedCallback) {
                    if (_.isFunction(oneOnTweetReceivedCallback)) {
                        oneOnTweetReceivedCallback(sendBody);
                    }
                });
            },
            onCloseConnection: function () {
                var sendBody = {
                    requestId: _requestId
                };
                _.each(_eventHandlers.closeConnection, function (oneOnCLoseConnectionCallback) {
                    if (_.isFunction(oneOnCLoseConnectionCallback)) {
                        oneOnCLoseConnectionCallback(sendBody);
                    }
                });
            },
            onRequestError: function (error, data) {
                var sendBody = {
                    error: error,
                    error_data: data,
                    requestId: _requestId
                };
                _.each(_eventHandlers.requestError, function (oneOnRequestErrorCallback) {
                    if (_.isFunction(oneOnRequestErrorCallback)) {
                        oneOnRequestErrorCallback(sendBody);
                    }
                });
            }
        },
        _addHandler = function (eventName, callback) {
            if (!_eventHandlers[eventName]) {
                _eventHandlers[eventName] = [];
            }
            _eventHandlers[eventName].push(callback);
        },
        _removeHandler = function (eventName) {
            if (eventName) {
                if (_eventHandlers[eventName]) {
                    _eventHandlers[eventName] = [];
                }
            }
        },
        _onChunkReceived = function (chunk) {
            console.log("Chunk received len=" + chunk.length);
            _buffer += chunk.toString();
            var rnPosition = _buffer.indexOf("\r\n");
            var holeTweet;
            while (rnPosition !== -1) {
                holeTweet = _buffer.substring(0, rnPosition);
                _buffer = _buffer.substring(rnPosition + 2);
                if (holeTweet.length) {
                    _onTweetReceived(JSON.parse(holeTweet));
                }
                rnPosition = _buffer.indexOf("\r\n");
            }
        },
        _onResponseCallback = function (error, data) {
            if (error) {
                _onError(error, data);
                return;
            }
            var parsedData = JSON.parse(data);
            if (parsedData.statuses && _.isArray(parsedData.statuses)) {
                _.each(parsedData.statuses, function (status) {
                    _onTweetReceived(status);
                });
            }
        },
        _onTweetReceived = function (oneTweet) {
            _eventHandlersExecutor.onTweetReceived(oneTweet);
        },
        _onCloseConnection = function () {
            console.log("Close connection");
            _eventHandlersExecutor.onCloseConnection();
        },
        _onError = function (error, data) {
            console.log("Error: " + error);
            _eventHandlersExecutor.onRequestError(error, data);
        },
        _closeConnection = function (callback) {
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
        },
        _startRequestStream = function (secret) {
            var oa = oAuthConsumer();
            var urlTarget = url.parse(_requestUrl);
            if (_requestMethod === "GET") {
                urlTarget.query = _requestParams;
                _streamRequest = oa.get(urlTarget.format(), _accessToken, secret);
            } else if (_requestMethod === "POST") {
                _streamRequest = oa.post(urlTarget.format(), _accessToken, secret, _requestParams);
            } else {
                _onError("Support only GET and POST");
                return;
            }
            _streamRequest.on("error", function (err) {
                _onError(err);
            });
            _streamRequest.on('response', function (responseLocal) {
                console.log("Get response");

                _streamResponse = responseLocal;
                _streamResponse.setEncoding('utf8');
                _streamResponse.on('data', function (chunk) {
                    _onChunkReceived(chunk);
                });
                _streamResponse.on('close', function () {
                    _onCloseConnection();
                });
            });
            _streamRequest.end();
        },
        _startRequest = function (secret) {
            var oa = oAuthConsumer();
            var targetUrl = url.parse(_requestUrl);
            var request;
            if (_requestMethod === "GET") {
                targetUrl.query = _requestParams;
                request = oa.get(targetUrl.format(), _accessToken, secret, _onResponseCallback);
            } else if (_requestMethod === "POST") {
                request = oa.post(targetUrl.format(), _accessToken, secret, _requestParams, _onResponseCallback);
            } else {
                _onError("Support only GET and POST");
                return;
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
        if (_requestIsStream) {
            _startRequestStream(secret);
        } else {
            _startRequest(secret);
        }
    });
};

exports.twitter = {
    isAccessTokenValid: verifyCredentials,
    getAccessToken: getAccessToken,
    getRequestToken: getRequestToken,
    searchTweets: searchTweets,
    proxyRequest: performProxyTwitterRequest
};