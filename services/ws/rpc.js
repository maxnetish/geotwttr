var _ = require('lodash');
var Connection = require('q-connection');

var serverStateService = require('./server-state');
var twitterStreamService = require('./twttr-stream');

var rpcInterface = require('./rpc-server-interface');

var localServices = {};
localServices[rpcInterface.STATE.SUBSCRIBE] = serverStateService.subscribe;
localServices[rpcInterface.STATE.UNSUBSCRIBE] = serverStateService.unsubscribe;
localServices[rpcInterface.TWITTER_STREAM.SUBSCRIBE] = twitterStreamService.subscribe;
localServices[rpcInterface.TWITTER_STREAM.UNSUBSCRIBE] = twitterStreamService.unsubscribe;

var LocalApi = function (socket) {
    var self = this,
        i, iLen;

    this.socket = socket;
    this.remote = Connection(socket, this, {max: 4096});
};

_.each(localServices, function (service, name) {
    LocalApi.prototype[name] = function () {
        var argsToApply = [this.socket, this.remote].concat(_.toArray(arguments));
        return service.apply(this, argsToApply);
    };
});

module.exports = {
    LocalApi: LocalApi,
    localServices: localServices
};
