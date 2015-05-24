/**
 * Probably not used
 * @type {exports|module.exports}
 * @private
 */

var _ = require('lodash');

var interval;
var subscribers = [];

var onInterval = function(){
    var servState = process.memoryUsage(),
        subscribersToRemove = [];

    _.each(subscribers, function(subscriber){
        if(subscriber.socket && subscriber.socket.readyState === subscriber.socket.OPEN){
            subscriber.remote.invoke(subscriber.remoteMethodName, servState)
                .then(null, function(err){
                    console.log(err);
                });
        }else{
            subscribersToRemove.push(subscriber);
        }
    });

    if(subscribersToRemove.length>0) {
        _.remove(subscribers, function (subscriber) {
            return _.some(subscribersToRemove, function (itemToRemove) {
                return subscriber === itemToRemove;
            });
        });
        if(subscribers.length === 0){
            stopStateUpdate();
        }
    }
};

var beginStateUpdate = function(){
    clearInterval(interval);
    interval = setInterval(onInterval, 5000);
};

var stopStateUpdate = function(){
    clearInterval(interval);
};

var subscribeState = function(socket, remote, remoteMethodName){
    if(subscribers.length === 0){
          beginStateUpdate();
    }
    subscribers.push({
        socket: socket,
        remote: remote,
        remoteMethodName: remoteMethodName
    });
    return true;
};

var unsubscribeState = function(socket, remote){
    removed = _.remove(subscribers, function(subscriber){
        return subscriber.socket === socket;
    });
    return (removed && removed.length);
};

module.exports = {
    subscribe: subscribeState,
    unsubscribe: unsubscribeState
};