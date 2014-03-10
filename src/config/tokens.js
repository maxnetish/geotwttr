var actualTokens = require('./tokens.dev');

var twitterConsumerKey = actualTokens.twitterConsumerKey,
    twitterConsumerSecret = actualTokens.twitterConsumerSecret,
    twitterCallbackUrl = actualTokens.twitterCallbackUrl,
    googleApiToken = actualTokens.googleApiToken,
    fsClientId = actualTokens.fsClientId,
    fsClientSecret = actualTokens.fsClientSecret,
    bitlyAccessToken=actualTokens.bitlyAccessToken;

exports.twitter = {
    consumerKey: twitterConsumerKey,
    consumerSecret: twitterConsumerSecret,
    callbackUrl: twitterCallbackUrl
};
exports.google = {
    apiToken: googleApiToken
};
exports.fs = {
    id: fsClientId,
    secret: fsClientSecret
};
exports.bitly={
    accessToken: bitlyAccessToken
};