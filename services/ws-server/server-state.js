var ctrl = function (data, socket) {
    var intervalHandler = setInterval(function () {
        if (socket.readyState === 1) {
            socket.send(JSON.stringify(process.memoryUsage()));
        } else {
            clearInterval(intervalHandler);
        }
    }, 5000);
};

module.exports = {
    controller: ctrl
};