/**
 * Created by max on 01.11.13.
 */

var actualTokens = require('./tokens.dev');

var twitterConsumerKey = actualTokens.twitterConsumerKey;
var twitterConsumerSecret = actualTokens.twitterConsumerSecret;
var twitterCallbackUrl = actualTokens.twitterCallbackUrl;
var googleApiToken = actualTokens.googleApiToken;

exports.twitter = {
    consumerKey: twitterConsumerKey,
    consumerSecret: twitterConsumerSecret,
    callbackUrl: twitterCallbackUrl
};
exports.google = {
    apiToken: googleApiToken
}