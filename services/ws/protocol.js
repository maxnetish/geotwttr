var _ = require('lodash');
var Q = require('q');

var WsMessage = function (src) {
    this.data = {};
    this.meta = {
        state: 'OK',
        cmd: null,
        err: null,
        errMessage: null
    }

    _.extend(this, src);
};

var serialize = function (data, state, cmd, err, errMessage) {
    var message = new WsMessage();
    if (!_.isEmpty(data)) {
        message.data = data;
    }
    if (_.isString(state)) {
        message.meta.state = state;
    }
    if (_.isString(cmd)) {
        message.meta.cmd = cmd;
    }
    if (!_.isEmpty(err)) {
        message.meta.err = err;
    }
    if (_.isString(errMessage)) {
        message.meta.errMessage = errMessage;
    }
    return JSON.stringify(message);
};

var deserialize = function (str) {
    var result = null;

    if (_.isEmpty(str)) {
        return;
    }

    try {
        result = JSON.parse(str);
    } catch (err) {
        return;
    }

    result = new WsMessage(result);
    return result;
};

var extendWebSocket = function(socket){
    socket.extend = socket.extend || {};
    _.each(socketExtender, function(fn, key){
       socket.extend[key] = fn.bind(socket);
    });
};

var socketExtender = {
    promiseSendData: function (data, state) {
        var dfr = Q.defer(),
            strToSend = serialize(data, state);
        this.send(strToSend, function (err, res) {
            if (err) {
                dfr.reject(err);
            } else {
                dfr.resolve(res);
            }
        });
        return dfr.promise;
    },
    promiseSendCommand: function (cmd, data) {
        var dfr = Q.defer(),
            strToSend = serialize(data, null, cmd);
        this.send(strToSend, function (err, res) {
            if (err) {
                dfr.reject(err);
            } else {
                dfr.resolve(res);
            }
        });
        return dfr.promise;
    },
    promiseSendError: function (err, errMessage) {
        var dfr = Q.defer(),
            strToSend = serialize(null, 'ERROR', null, err, errMessage);
        this.send(strToSend, function (errResult, res) {
            if (errResult) {
                dfr.reject(errResult);
            } else {
                dfr.resolve(res);
            }
        });
        return dfr.promise;
    }
};

module.exports = {
    messageData: function (data, state) {
        return serialize(data, state);
    },
    messageCommand: function (cmd, data) {
        return serialize(data, null, cmd);
    },
    messageError: function (err, errMessage) {
        return serialize(null, 'ERROR', null, err, errMessage);
    },
    restore: deserialize,
    extendWebSocket: extendWebSocket
};
