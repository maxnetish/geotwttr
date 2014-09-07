/**
 * Created by max on 29.10.13.
 */

var twitterHelper = require('../helpers/twitter').twitter;

exports.auth = function (req, res) {
    twitterHelper.getRequestToken(function (error, requestToken, requestTokenSecret, result) {
        if (error) {
            console.log(error);
            return;
        }
        if (!result.oauth_callback_confirmed) {
            console.log("Request token not confirmed");
            return;
        }
        console.log("Request tokens obtained, redirect to twttr");
        res.redirect("https://api.twitter.com/oauth/authenticate?oauth_token=" + requestToken);
    });
};