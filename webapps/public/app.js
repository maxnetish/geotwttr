/**
 * main module
 * run up
 */

var router = require('./router');
var koComponents = require('./ko.components');
var koBindings = require('./ko.bindings');
var ws = require('./services/ws');
var Connection = require('q-connection');

router.run();

koBindings.register();
koComponents.registerComponents();
koComponents.registerApp();

//ws.promiseSocket().then(function (socket) {
//    var remote = Connection(socket, {
//        readValue: function(){
//            return 'value from client'
//        }
//    });
//    var foo = remote.invoke('readValue').then(function (remoteValue) {
//        console.log(arguments);
//    }, function () {
//        console.log(arguments);
//    });
//});

var ko = require('knockout');
var socket = new WebSocket('ws://127.0.0.1:3000');
var serverState = ko.observable();
var localApi = {
    serverState: function(newVal){
        serverState(newVal);
        return true;
    }
};
var remote = Connection(socket, localApi);

serverState.subscribe(function(val){
    console.log(val);
});

remote.invoke('subscribeState').then(function (handler) {
    console.log(handler);
}, function (err) {
    console.log(err);
});




