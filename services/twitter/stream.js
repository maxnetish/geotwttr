var store = require('../../helpers/store').store,
    OAuth = require('oauth').OAuth,
    config = require('../../config'),
    tokens = require('../../config/tokens'),
    url = require('url'),
    _ = require('lodash'),
    Q = require('q');

var streamDelimiter = '\r\n';

/**
 *
 * @param socket
 * @param remote
 * @param opts: {
 *          accessToken:
 *          method: GET or POST
 *          url:
 *          data: request params
 *      }
 * @constructor
 */
var StreamRequest = function (opts) {
    var requestMethod = opts.method || 'GET',
        accessToken = opts.accessToken,
        requestUrl = opts.url,
        self = this;

    store.getSecret(accessToken)
        .then(function (secret) {
            self._init(requestMethod, requestUrl, opts.data, secret);
        });

    this.accessToken = accessToken;
    this._buffer = '';
    this._deferred = Q.defer();
    this.promise = this._deferred.promise;
    this.id = _.uniqueId();
    this.request = null;
    this.response = null;
    this.dispose = function () {
        if (this.request) {
            this.request.abort();
        }
    };
};

StreamRequest.prototype._onDataChunkReceived = function (dataChunk) {
    var rnPosition, holeTweet, tweet;

    this._buffer += dataChunk.toString();
    rnPosition = this._buffer.indexOf(streamDelimiter);
    while (rnPosition !== -1) {
        holeTweet = this._buffer.substring(0, rnPosition);
        this._buffer = this._buffer.substring(rnPosition + streamDelimiter.length);
        if (holeTweet.length) {
            try {
                tweet = JSON.parse(holeTweet);
            }
            catch (err) {
                console.log('Cannot parse "' + holeTweet + '"');
            }
            if (tweet) {
                this._deferred.notify(tweet);
            }
        }
        rnPosition = this._buffer.indexOf(streamDelimiter);
    }
};

StreamRequest.prototype._onResponse = function (response) {
    var self = this;
    response.setEncoding('utf8');
    response.on('data', function (dataChunk) {
        self._onDataChunkReceived(dataChunk);
    });
    response.on('close', function (event) {
        // TODO after close stream...
        self._deferred.resolve(event);
    });
    this.response = response;
};

StreamRequest.prototype._init = function (requestMethod, requestUrl, requestData, secret) {
    var accessToken = this.accessToken;
    var request;
    var oauth = new OAuth(
        config.twitter.requestTokenUrl,
        config.twitter.accessTokenUrl,
        tokens.twitter.consumerKey,
        tokens.twitter.consumerSecret,
        config.twitter.oauthVersion,
        null,
        config.twitter.oauthDigest);
    var self = this;
    switch (requestMethod) {
        case 'GET':
            requestUrl = url.parse(requestUrl, true);
            _.extend(requestUrl.query, requestData);
            requestUrl = requestUrl.format();
            request = oauth.get(requestUrl, accessToken, secret);
            break;
        case 'POST':
            request = oauth.post(requestUrl, accessToken, secret, requestData);
            break;
        default:
            throw new Error('Allow only POST or GET');
            return;
    }
    request.on('error', function (err) {
        // TODO error handler
        console.log('request returns error:');
        console.log(err);
        self._deferred.reject(err);
    });
    request.on('response', function (response) {
        self._onResponse(response);
    });
    request.end();

    this.request = request;
};

module.exports = StreamRequest;
