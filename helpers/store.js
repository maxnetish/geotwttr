/**
 * Created by max on 29.10.13.
 */

var SessionStore = require('../models').SessionStore;

function promiseSetTokens(accessToken, accessTokenSecret, userId) {
    var criteria = {
        userId: userId
    };
    var newSession = {
        tokenSecret: accessTokenSecret,
        accessToken: accessToken
    };

    return SessionStore.findOneAndUpdate(criteria, newSession, {
        new: true,
        upsert: true
    }).lean().exec();
}

function promiseAccessTokenSecret(accessToken) {
    return SessionStore.findOne({accessToken: accessToken}).lean().exec()
        .then(function (finded) {
            if (finded) {
                return finded.tokenSecret;
            }
            return null;
        });
}

exports.store = {
    getSecret: promiseAccessTokenSecret,
    setSecret: promiseSetTokens
};
