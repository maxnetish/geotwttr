/**
 * Created by max on 29.10.13.
 */

var redis = require('redis'),
    client = redis.createClient(),

    getAccessTokenSecret = function (accessToken, callback) {
        console.log("We are get secret from store, accessToken=" + accessToken);
        callback = callback || function () {
        };
        if (!accessToken) {
            callback(null, null);
            return;
        }
        client.get(accessToken, function (err, reply) {
            // reply is null when the key is missing
            console.log("Secret received from strore, secret=" + reply);
            if (err) {
                callback(err, null);
                return;
            }
            callback(null, reply);
        });
    },

    setAccessTokenSecret = function (accessToken, accessTokenSecret) {
        if (!accessToken) {
            return;
        }
        client.set(accessToken, accessTokenSecret);
    };

exports.store = {
    getSecret: getAccessTokenSecret,
    setSecret: setAccessTokenSecret
};
