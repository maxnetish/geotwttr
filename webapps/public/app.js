/**
 * main module
 * run up
 */

var router = require('./router');
var koComponents = require('./ko.components');
var koBindings = require('./ko.bindings');

router.run();

koBindings.register();
koComponents.registerComponents();
koComponents.registerApp();

var ws = require('./services/ws');
var localObservables = require('./services/local-rpc').observables;

localObservables.serverState.subscribe(function(val){
    console.log(val);
});

ws.getRemote().invoke('subscribeState').then(function (handler) {
    console.log(handler);
}, function (err) {
    console.log(err);
});

setTimeout(function(){
    ws.getRemote().invoke('unsubscribeState');
}, 20000);

ws.getRemote().invoke('subscribeState2', 'state2Resp').then(function (handler) {
    console.log(handler);
}, function (err) {
    console.log(err);
});

ws.localApi.state2Resp = function(arg){
    console.log('state2Resp: '+arg);
    return 'Принято динамически'
};




