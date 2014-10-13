module.exports = {
    containsText: new require('./contains-text')(),
    geotagged: new require('./really-geotagged')(),
    language: new require('./specific-language')()
};