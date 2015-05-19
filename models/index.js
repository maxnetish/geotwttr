var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/geotwttrdb');

module.exports = {
    SessionStore: require('./session-store').createModel(mongoose)
};