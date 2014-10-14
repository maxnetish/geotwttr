module.exports = {
    geotagged: new (require('./really-geotagged'))(),
    language: new (require('./specific-language'))(),
    containsText: new (require('./contains-text'))()
};