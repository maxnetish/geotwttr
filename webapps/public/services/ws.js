var global = (function () {
    return this;
})();
var WebSocket = global.WebSocket || global.MozWebSocket;
var Q = require('q');
var _ = require('lodash');
var ko = require('knockout');
var Connection = require('q-connection');
var localApi = require('./local-rpc').api;

var remote;

var createSocket = function () {
    var socketInstance = new WebSocket('ws://' + global.document.location.host.replace(/:.*/, '') + (global.document.location.port ? ':' + window.document.location.port : ''));
    return socketInstance;
};

var getRemote = function(){
    if(!remote){
        remote = Connection(createSocket(), localApi, {max: 4096});
    }
    return remote;
};

module.exports = {
    getRemote: getRemote,
    localApi: localApi
};