var _ = require('lodash');
var Connection = require('q-connection');

var serverStateService = require('./server-state');

var localServices = {
    subscribeState: serverStateService.subscribe,
    unsubscribeState: serverStateService.unsubscribe,
    subscribeState2: function(socket, remote, arg){
        var destName = arg;
        setTimeout(function(){
           remote.invoke(destName, 'Динамический ОТвет');
        }, 6000);
        return true;
    }
};

var LocalApi = function (socket) {
    var self = this,
        i, iLen;

    this.socket = socket;
    this.remote = Connection(socket, this, {max: 4096});
};

_.each(localServices, function (service, name) {
    LocalApi.prototype[name] = function (arg) {
        return service(this.socket, this.remote, arg);
    };
});

module.exports = {
    LocalApi: LocalApi,
    localServices: localServices
};
