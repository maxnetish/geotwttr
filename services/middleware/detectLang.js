/**
 * add langCode
 */

var detectLang = function (req, res, next) {
    var langCode = 'en';
    if (req.headers && req.headers["accept-language"]) {
        langCode = req.headers["accept-language"].split(";")[0].split(",")[0].trim();
    }
    req.langCode = langCode;
    next();
};

module.exports = detectLang;