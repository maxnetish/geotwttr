/**
 * Created by Gordeev on 09.03.14.
 *
 * (не используется пока)
 */

var tokens = require('../config/tokens'),
    store = require('../helpers/store').store,
    request = require('request'),
    url = require('url'),
    querystring = require('querystring');

var expandUrl = function (shortUrl, callback) {
    var result;
    request({
        method: "GET",
        uri: "https://api-ssl.bitly.com/v3/expand",
        qs: {
            shortUrl: shortUrl,
            format: "json",
            access_token: tokens.bitly.accessToken
        },
        json: true
    }, function (error, response, body) {
        if (error) {
            callback(error, null);
        } else {
            if (body && body.data && body.data.expand && body.data.expand.length) {
                result = body.data.expand[0].long_url;
            } else {
                result = null;
            }
            callback(null, result);
        }
    });
};

var createResponseObject = function (data, code, error) {
    return {
        meta: {
            code: code,
            error: error
        },
        data: data
    };
};

exports.fsProxy = function (req, res) {
    var accessToken,
        shortUrl = req.query.fs,
        langCode;

    if (!shortUrl) {
        res.send(createResponseObject(undefined, 400));
        return;
    }

    // extract culture code
    if (req.headers && req.headers["accept-language"]) {
        langCode = req.headers["accept-language"].split(";")[0].split(",")[0].trim();
    }

    //check access token
    accessToken = req.signedCookies.at;
    store.getSecret(accessToken, function (error, secret) {
        if (!secret) {
            res.send(createResponseObject(undefined, 401, error));
        } else {
            expandUrl(shortUrl, function (error, expandedUrl) {
                var checkinId, expandedUrlAsUrl, pathEntries,
                    signature;
                if (!expandedUrl) {
                    res.send(createResponseObject(undefined, 400, error));
                } else {
                    expandedUrlAsUrl = url.parse(expandedUrl);
                    pathEntries = expandedUrlAsUrl.pathname.split('/');
                    checkinId = pathEntries.pop();
                    signature = querystring.parse(expandedUrlAsUrl.query).s;
                    request({
                        uri: 'https://api.foursquare.com/v2/checkins/' + checkinId,
                        qs: {
                            signature: signature,
                            client_id: tokens.fs.id,
                            client_secret: tokens.fs.secret,
                            v: '20140301'
                        },
                        headers: {
                            'Accept-Language': langCode
                        },
                        method: 'GET',
                        json: true
                    }, function (error, response, body) {
                        if (error) {
                            res.send(createResponseObject(undefined, 400, error));
                        } else {
                            res.send(createResponseObject(body));
                        }
                    });
                }
            });
        }
    });
};