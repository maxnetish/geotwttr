var WebSocketServer = require('ws').Server;
var cookieParser = require('cookie-parser');
var twitterAuthService = require('./../twitter/auth');

var customClientVerify,
    receivers = {};

var verifyClientDefault = function (info, cb) {
    var accessToken;

    // parse cookie
    cookieParser('A12-dmcd=Asd365%bjldkloed(uhn')(info.req, null, function () {});
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

var onConnection = function (socket) {
    socket.on('message', function(data, flags){
        try{
            data = JSON.parse(data);
        }
        catch (err){
            return;
        }
        if(!data || !data.cmd){
            return;
        }
        if(!receivers.hasOwnProperty(data.cmd)){
            return;
        }
        receivers[data.cmd](data, socket);
    });
};

var createServer = function (httpServerInstance) {
    var wsServerInstance = new WebSocketServer({
        server: httpServerInstance,
        verifyClient: customClientVerify || verifyClientDefault
    });
    wsServerInstance.on('connection', onConnection);
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
    use: use
};