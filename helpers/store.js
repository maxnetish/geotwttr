/**
 * Created by max on 29.10.13.
 */

var redis = require('redis'),
    Q = require('q'),
    client = redis.createClient(),
    _ = require('lodash');

    getAccessTokenSecret = function (accessToken, callback, context) {
        // console.log("We are get secret from store, accessToken=" + accessToken);
        var dfr = Q.defer();

        client.get(accessToken, function (err, reply) {
            // reply is null when the key is missing
            // console.log("Secret received from strore, secret=" + reply);
            if(_.isFunction(callback)){
                callback.call(context, err, reply);
            }
            if (err) {
                dfr.reject(err);
            }else{
                dfr.resolve(reply);
            }
        });

        return dfr.promise;
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
