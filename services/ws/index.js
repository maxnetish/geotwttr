var WS = require('ws');
var WebSocketServer = WS.Server;
var cookieParser = require('cookie-parser');
var twitterAuthService = require('./../twitter/auth');
var protocol = require('./protocol');
var _ = require('lodash');
var Connection = require('q-connection');

var customClientVerify,
    receivers = {},
    wsServerInstance;

var verifyClientDefault = function (info, cb) {
    var accessToken;

    // parse cookie
    cookieParser('A12-dmcd=Asd365%bjldkloed(uhn')(info.req, null, function () {
    });
    accessToken = info.req.signedCookies && info.req.signedCookies.at;

    if (!accessToken) {
        cb(false, 401, 'Denied');
        return;
    }

    // check auth
    twitterAuthService.verifyCredentials(accessToken).then(function (userInfo) {
        if (userInfo) {
            cb(true);
        } else {
            cb(false, 401, 'Denied');
        }
    }, function (err) {
        cb(false, 401, 'Denied');
    });
};

var onMessage = function (data, flags) {
    // context will be WebSocket instance
//    var parsed = protocol.restore(data);
//    if (parsed && receivers.hasOwnProperty(parsed.meta.cmd)) {
//        receivers[parsed.meta.cmd](parsed, this, wsServerInstance);
//    }
    console.log('receive: ' + data);
};

var onSocketError = function (err) {
    // context will be probably WebSocket instance
    if (this.readyState === this.OPEN) {
        // gracefully close
        this.close('Socket error');
    } else {
        // socket not open
        // kill socket
        this.terminate();
    }
};

var onConnection = function (socket) {
    var localApi = {
        subscribeState: function () {
            var h = setInterval(function () {
                console.log('exec interval callback');
                if (socket.readyState === socket.OPEN) {
                    remote.invoke('serverState', process.memoryUsage()).then(function (res) {
                        console.log(res);
                    }, function (err) {
                        console.log(err);
                    });
                } else {
                    clearInterval(h);
                }
            }, 5000);
            return h;
        }
    };
    var remote = Connection(socket, localApi);

//    protocol.extendWebSocket(socket);
    socket.on('error', onSocketError)
    socket.on('message', onMessage);
};

var onServerError = function (err) {
    // underlying protocol error
    console.log(err);
    wsServerInstance.close();
    wsServerInstance = null;
};

var createServer = function (httpServerInstance) {
    if (wsServerInstance) {
        wsServerInstance.close();
    }
    wsServerInstance = new WebSocketServer({
        server: httpServerInstance,
        verifyClient: customClientVerify || verifyClientDefault
    });

    wsServerInstance.on('connection', onConnection);
    wsServerInstance.on('error', onServerError);
    return wsServerInstance;
};

var setVerify = function (verify) {
    customClientVerify = verify;
};

var use = function (command, controller) {
    receivers[command] = controller;
};

use('state', require('./server-state').controller);

module.exports = {
    createServer: createServer,
    setVerify: setVerify,
    use: use,
    serverInstance: wsServerInstance
};