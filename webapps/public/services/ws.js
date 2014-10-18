/**
 * Created by mgordeev on 17.10.2014.
 */
// shared module!
var protocol = require('../../../services/ws/protocol');
var global = (function () {
    return this;
})();
var WebSocket = global.WebSocket || global.MozWebSocket;
var Q = require('q');
var _ = require('lodash');
var socketEvents = {
    CLOSE: 'close',
    ERROR: 'error',
    OPEN: 'open',
    MESSAGE: 'message'
};

var socketInstance;
var listeners = {};


var onevent = function (event) {
    if (!listeners.hasOwnProperty(event.type)) {
        return;
    }
    _.each(listeners[event.type], function (listener) {
        listener.callback(event);
    });
};

var addHooks = function (socket) {
    _.each(socketEvents, function (eventName) {
        socket['on' + eventName] = onevent;
    });
};

var addListenerInternal = function (eventName, fn) {
    var id = _.uniqueId();
    if (!listeners.hasOwnProperty(eventName)) {
        listeners[eventName] = [];
    }
    listeners[eventName].push({
        callback: fn,
        id: id
    });
    return id;
};

var removeListenerInternal = function (id) {
    var eventType,
        index;
    eventType = _.findKey(listeners, function (listenersForEvent) {
        var i = _.findIndex(listenersForEvent, function (listener) {
            return listener.id === id;
        });
        index = i;
        return i !== -1;
    });
    if (eventType && index >= 0) {
        listeners[eventType].splice(index, 1);
    }
};

var removeListenersInternal = function (ids) {
    _.each(ids, removeListenerInternal);
};

var openNew = function () {
    var host = window.document.location.host.replace(/:.*/, ''),
        port = window.document.location.port ? ':' + window.document.location.port : '';
    socketInstance = new WebSocket('ws://' + host + port);
    addHooks(socketInstance);
};

var getSocket = function () {
    var dfr = Q.defer(),
        listeners = [],

        waitForOpenOrError = function () {
            listeners.push(addListenerInternal(socketEvents.ERROR, function (event) {
                dfr.reject(event.type);
                _.defer(removeListenersInternal, listeners);
            }));
            listeners.push(addListenerInternal(socketEvents.OPEN, function (event) {
                dfr.resolve(socketInstance);
                _.defer(removeListenersInternal, listeners);
            }));
        };

    if (!socketInstance || socketInstance.readyState === socketInstance.CLOSED || socketInstance.readyState === socketInstance.CLOSING) {
        openNew();
        waitForOpenOrError();
        return dfr.promise;
    }

    if (socketInstance.readyState === socketInstance.CONNECTING) {
        waitForOpenOrError();
        return dfr.promise;
    }

    dfr.resolve(socketInstance);
    return dfr.promise;
};

module.exports = {
    promiseSocket: getSocket,
    addListener: addListenerInternal,
    removeListener: removeListenerInternal
};