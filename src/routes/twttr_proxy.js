/**
 * Created by max on 30.10.13.
 */

var twitterHelper = require('../helpers/twitter').twitter;
exports.searchTweets = function (req, res) {
    var accessToken = req.signedCookies.at;
    var searchOptions = req.query;

    twitterHelper.searchTweets(accessToken, searchOptions, function (error, result) {
        if (error) {
            res.statusCode = 500;
            res.end(error);
            return;
        }
        res.send(result);
    });
};