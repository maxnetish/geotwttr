var Q = require('q');
var _ = require('lodash');
var ws = require('./ws');
var actions = require('../actions');
var gmapUtils = require('./utils');
var serverInterface = require('../../../services/ws/rpc-server-interface');

var notifyFnBase = 'streamResp';

function Provider() {
    this._requestId = null;
    this._notifyFn = null;
}

Provider.prototype._streamResponse = function(resp){
    if (resp.tweet && resp.tweet.id && resp.id === this._requestId) {
        // supress 'not our' response and
        // tweet really
        actions.tweetProvider.receiveTweet(resp.tweet);
    } else if (resp.tweet && resp.tweet.message) {
        actions.tweetProvider.receiveMessage(resp.tweet.message);
    } else {
        actions.tweetProvider.receiveMessage('Strange unknown response');
        console.log({
            title: 'Uknown response',
            content: JSON.stringify(resp)
        });
    }
    return 'OK';
};

Provider.prototype.unsubscribe = function () {
    if (this._requestId) {
        ws.getRemote().invoke(serverInterface.TWITTER_STREAM.UNSUBSCRIBE, this._requestId)
            .then(function (res) {
                console.log('unsubscribe response: ' + res);
                actions.tweetProvider.unsubscribe(res);
                return res;
            }, function (err) {
                console.log('unsubscribe error: ' + err);
                actions.tweetProvider.receiveError(err);
                throw err;
            });
        ws.api.remove(this._notifyFn);
        this._requestId = null; // from this moment we won't receive from closing stream -> wait new stream
    }
};

Provider.prototype.subscribe = function (opts) {
    var self = this;
    var newNotifyFnName = _.uniqueId(notifyFnBase);
    var  selection = opts.geoSelection || {};

    this.unsubscribe();

    ws.api.add(newNotifyFnName, _.bind(self._streamResponse, self));
    this._notifyFn = newNotifyFnName;

    return gmapUtils.centerRadiusToBoundsPromise(selection.center.lat, selection.center.lng, selection.radius)
        .then(function (gmapBounds) {
            var twitterBounds = gmapUtils.boundsToTwitterString(gmapBounds);
            return ws.getRemote().invoke(serverInterface.TWITTER_STREAM.SUBSCRIBE, {
                notify: newNotifyFnName,
                reqMethod: 'GET',
                reqUrl: 'https://stream.twitter.com/1.1/statuses/filter.json',
                reqData: {
                    locations: twitterBounds,
                    stall_warnings: 'true'
                }
            });
        })
        .then(function (resp) {
            console.log('subscribe id:');
            console.log(resp);
            self._requestId = resp;
            actions.tweetProvider.subscribe(resp);
            return resp;
        }, function (err) {
            console.log(err);
            actions.tweetProvider.receiveError(err);
            throw err;
        });
};

module.exports = {
    Provider: Provider
};