var protocol = require('./protocol');
var _ = require('lodash');

var ctrl = function (data, socket, server) {
    var intervalHandler = setInterval(function () {
        if (socket.readyState === socket.OPEN) {
            socket.extend.promiseSendData({
                memory: process.memoryUsage(),
                clients: server.clients.length
            }).then(_.noop(), function(err){
                // stop sending if socket error
                clearInterval(intervalHandler);
            });
        } else {
            // stop sending if socket not open
            clearInterval(intervalHandler);
        }
    }, 15000);
};

module.exports = {
    controller: ctrl
};