var WS = require('ws');
var WebSocketServer = WS.Server;
var cookieParser = require('cookie-parser');
var twitterAuthService = require('./../twitter/auth');
var _ = require('lodash');
var LocalRpc = require('./rpc').LocalApi;
var logger = require('../../helpers/logger');

var customClientVerify,
    wsServerInstance;

var verifyClientDefault = function (info, cb) {
    // we should use callback here because function will be pass to Websocket Server ctor
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
        // sorry, use side effect
        info.req.user = userInfo;
        if (userInfo) {
            cb(true);
        } else {
            cb(false, 401, 'Denied');
        }
        logger.message.add.auth(userInfo.id);
        return userInfo;
    }, function (err) {
        logger.error(err);
        cb(false, 401, 'Denied');
    });
};

var onMessage = function (data, flags) {
    //console.log('receive: ' + data);
};

var onSocketError = function (err) {
    logger.error(err);
    // context will be rpc instance
    if (this.socket && this.socket.readyState === this.OPEN) {
        // gracefully close
        this.socket.close('Socket error');
    } else {
        // socket not open
        // kill socket
        this.socket.terminate();
    }
};

var onConnection = function (socket) {
    var rpc = new LocalRpc(socket);
    socket.on('error', _.bind(onSocketError, rpc));
    socket.on('message', _.bind(onMessage, rpc));
};

var onServerError = function (err) {
    // underlying protocol error
    logger.error(err);
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

module.exports = {
    createServer: createServer,
    setVerify: setVerify,
    serverInstance: wsServerInstance
};