var AccessLog = require('../models').AccessLog
var ErrorLog = require('../models').ErrorLog;
var debug = require('../app').get('env') === 'development';
var _ = require('lodash');

function prodHandler(err) {
    return ErrorLog.addRecord(err);
}

function devHandler(err) {
    console.log(err);
    return ErrorLog.addRecord(err);
}

function addAuth(userId) {
    return AccessLog.addRecord(userId, 'AUTH');
}

function addRequest(userId, reqParams) {
    return AccessLog.addRecord(userId, 'REQ', reqParams);
}

function addResponse(userId, response) {
    return AccessLog.addRecord(userId, 'RES', response);
}

module.exports = {
    error: debug ? devHandler : prodHandler,
    message: {
        auth: addAuth,
        request: addRequest,
        response: addResponse
    }
};

