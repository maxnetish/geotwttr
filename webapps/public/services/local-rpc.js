
var ko  =require('knockout');

var serverStateObservable = ko.observable();

var serverState = function(state){
    serverStateObservable(state);
    return true;
};

module.exports = {
    observables: {
        serverState: serverStateObservable
    },
    api: {
        serverState: serverState
    }
};