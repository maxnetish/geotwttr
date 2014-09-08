/**
 * Created by mgordeev on 08.09.2014.
 */

var store = require('../../helpers/store').store,
    OAuth = require('oauth').OAuth,
    twitterConfig = require('../../config').twitter,
    url = require('url'),
    _ = require('lodash'),
    querystring = require('querystring'),
    Q = require('q');

var argumentsToArray = function (args) {
    return Array.prototype.slice.call(args, 0);
};

var oAuthConsumer = function () {
        return new OAuth
        (
            twitterConfig.requestTokenUrl,
            twitterConfig.accessTokenUrl,
            twitterConfig.consumerKey,
            twitterConfig.consumerSecret,
            twitterConfig.oauthVersion,
            null,
            twitterConfig.oauthDigest
        );
    },

    getRequestToken = function (callback, context) {
        var oa = oAuthConsumer();
        var dfr = Q.defer();
        oa.getOAuthRequestToken(null, function (err, requestToken, requestTokenSecret, result) {
            console.log('We receive request tokens:');
            console.dir(arguments);
            var argsArray = argumentsToArray(arguments);
            if (_.isFunction(callback)) {
                callback.apply(context, argsArray);
            }
            if (err) {
                dfr.reject(err);
            } else {
                dfr.resolve({
                    requestToken: requestToken,
                    requestTokenSecret: requestTokenSecret,
                    result: result
                });
            }
        });
        return dfr.promise;
    },

    getAccessToken = function (requestTokenOrOpts, tokenSecret, requestVerifier, callback, context) {
        var oa = oAuthConsumer(),
            opts,
            dfr = Q.defer();

        if (_.isString(requestTokenOrOpts)) {
            opts = {
                requestToken: requestTokenOrOpts,
                tokenSecret: tokenSecret,
                requestVerifier: requestVerifier,
                callback: callback,
                context: context
            };
        } else {
            opts = requestTokenOrOpts;
        }

        oa.getOAuthAccessToken(opts.requestToken, opts.tokenSecret, opts.requestVerifier, function (err, authToken, authTokenSecret, results) {
            console.log('we receive oauth tokens:');
            console.dir(arguments);
            var argsArray = argumentsToArray(arguments);
            if (_.isFunction(opts.callback)) {
                opts.callback.apply(opts.context, argsArray);
            }
            if (err) {
                dfr.reject(err);
            } else {
                dfr.resolve({
                    authToken: authToken,
                    authTokenSecret: authTokenSecret
                });
            }
        });

        return dfr.promise;
    },

    verifyCredentials = function (accessToken, callback, context) {
        var dfr = Q.defer();

        store.getSecret(accessToken).then(function (secret) {
            var oa = oAuthConsumer();
            console.log('VerifyCredentials for accessToken: '+accessToken+', secret: '+secret);
            oa.get("https://api.twitter.com/1.1/account/verify_credentials.json?skip_status=1", accessToken, secret, function (error, result) {
                var accountInfo;
                console.dir(error);
                if (!error) {
                    try {
                        accountInfo = JSON.parse(result);
                    } catch (parseErr) {
                        error = parseErr;
                    }
                }
                if (_.isFunction(callback)) {
                    callback.call(context, error, accountInfo);
                }
                if (error) {
                    try {
                        error.message = JSON.parse(error.data).errors[0].message;
                    } catch (e) {}
                    dfr.reject(error);
                } else {
                    dfr.resolve(accountInfo);
                }
            });
        }).then(null, dfr.reject);
        return dfr.promise;
    };

module.exports = {
    getRequestToken: getRequestToken,
    getAccessToken: getAccessToken,
    verifyCredentials: verifyCredentials
};