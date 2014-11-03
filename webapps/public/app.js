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

// ws demo
//var ws = require('./services/ws');

//console.log('invoke subscribe');
//ws.getRemote().invoke('subscribeState', 'stateResp').then(function (response) {
//    console.log('subscribe response:');
//    console.log(response);
//}, function (err) {
//    console.log(err);
//});
//
//ws.localApi.stateResp = function (arg) {
//    console.log('stateResp:');
//    console.log(arg);
//    return 'Принято динамически';
//};
//
//setTimeout(function () {
//    console.log('invoke unsubscribe');
//    ws.getRemote().invoke('unsubscribeState').then(function (response) {
//        delete ws.localApi.stateResp;
//        console.log('unsuscribe response:');
//        console.log(response);
//        return true;
//    });
//}, 30000);

//var reqId;
//ws.getRemote().invoke('subscribeTwitterStream', {
//    notify: 'streamResp',
//    reqMethod: 'GET',
//    reqUrl: 'https://stream.twitter.com/1.1/statuses/filter.json',
//    reqData: {
//        locations: '16.542346660240696,49.1439480630349,16.679794605628445,49.23377959144685',
//        stall_warnings: 'true'
//    }
//}).then(function (resp) {
//    console.log('subscribe id:');
//    console.log(resp);
//    reqId = resp;
//}, function (err) {
//    console.log(err);
//});
//
//ws.localApi.streamResp = function (resp) {
//    console.log(resp);
//    return 'Принято';
//};
//
//setTimeout(function () {
//    ws.getRemote().invoke('unsubscribeTwitterStream', reqId)
//        .then(function (res) {
//            console.log('unsubscribe response: ' + res);
//        });
//}, 60000);





