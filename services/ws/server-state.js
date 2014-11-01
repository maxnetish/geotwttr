var interval;

var subscribeState = function(socket, remote){
    clearInterval(interval);
    interval = setInterval(function () {
        console.log('exec interval callback');
        if (socket && socket.readyState === socket.OPEN) {
            remote.invoke('serverState', process.memoryUsage()).then(function (res) {
                console.log(res);
            }, function (err) {
                console.log(err);
            });
        } else {
            clearInterval(interval);
        }
    }, 5000);
    return true;
};

var unsubscribeState = function(socket, remote){
    clearInterval(interval);
    return true;
};

module.exports = {
    subscribe: subscribeState,
    unsubscribe: unsubscribeState
};