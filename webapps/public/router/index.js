/**
 * Created by Gordeev on 07.09.2014.
 */

var libs = require('../libs'),
    path = libs.path,
    _ = libs._,
    ko = libs.ko,
    State = require('./state'),
    services = require('../services');

var stateParamName = 'stateSerialized';
var appState = new State();
var appStateDefault = new State();

var onUrlChange = _.throttle(function () {
    var row = this.params[stateParamName];
    appState.updateFromSerialized(row);
    console.log('url changed, set state:');
    console.dir(appState);
}, 1000);

var onStateChange = _.throttle(function () {
    console.log('state change:');
    console.dir(appState);
}, 1000);

var getCurrentStateUrl = function () {
    var result;
    result = '/#!/app/' + appState.serialize();
    return result;
};

var run = function () {

    path.map('#!/app(/:' + stateParamName + ')')
        .enter(function () {})
        .to(onUrlChange)
        .exit(function () {});

    path.root('#!/app');

    path.rescue(function () {
        console.log('404: Route Not Found: ' + window.location.hash);
    });

    path.listen();
};

_.forOwn(appState, function (value, key) {
    if (ko.isObservable(value)) {
        value.subscribe(onStateChange);
    }
});

services.localStorage.registerPermanentObservable(services.localStorage.keys.CENTER, appState.center, appState.center());
services.localStorage.registerPermanentObservable(services.localStorage.keys.ZOOM, appState.zoom, appState.zoom());

module.exports = {
    run: run,
    appState: appState,
    getCurrentStateUrl: getCurrentStateUrl
};