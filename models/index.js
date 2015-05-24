var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/geotwttrdb');

module.exports = {
    SessionStore: require('./session-store').createModel(mongoose),
    AccessLog: require('./access-log').createModel(mongoose),
    ErrorLog: require('./error-log').createModel(mongoose)
};