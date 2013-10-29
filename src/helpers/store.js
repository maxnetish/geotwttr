/**
 * Created by max on 29.10.13.
 */

var redis = require('redis');
var client = redis.createClient();

var getAccessTokenSecret = function (accessToken, callback) {
    callback = callback || function () {
    };

    if (!accessToken) {
        callback(null, null);
        return;
    }

    client.get(accessToken, function (err, reply) {
        // reply is null when the key is missing
        console.log(reply);
        if (err) {
            callback(err, null);
            return;
        }
        callback(null, reply);
    });
};

var setAccessTokenSecret = function (accessToken, accessTokenSecret) {

    if (!accessToken) {
        return;
    }

    client.set(accessToken, accessTokenSecret);
};

exports.store = {
    getSecret: getAccessTokenSecret,
    setSecret: setAccessTokenSecret
};
