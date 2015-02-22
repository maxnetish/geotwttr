var libs = require('../libs'),
    _ = libs._,
    EventEmitter = libs.EventEmitter,
    dispatcher = libs.dispatcher,
    actions = require('../actions'),
    services = require('../services');

var tweetFeedControlStore = require('./tweet-feed-control-store'),
    mapStore = require('./map-store');

var eventNames = Object.freeze({
    EVENT_FEED_CHANGE: 'event-feed-change'
});

var internals = {
    visibleTweets: [],
    hidedTweets: [],
    showImmediate: true,
    requestId: null
};

var onTweetReceive = function (tw) {
    console.log('TweetFeedStore receive tweet ' + tw.id_str);
    if (internals.showImmediate) {
        internals.visibleTweets.unshift(tw);
    } else {
        internals.hidedTweets.unshift(tw);
    }
    tweetFeedStore.emitFeedChange();
};

var onSelectionChanged = function (selection) {
    if(_.isFunction(tweetFeedStore.emitFeedChange.cancel)){
        console.log('cancel deferred emitFeedChange');
        tweetFeedStore.emitFeedChange.cancel();
    }
    internals.visibleTweets.length = 0;
    internals.visibleTweets.length = 0;
    tweetFeedStore.emitFeedChange();

    if (internals.requestId) {
        services.ws.getRemote().invoke('unsubscribeTwitterStream', internals.requestId).then(function (res) {
            console.log('unsubscribe response: ' + res);
        });
    }

    libs.promiseGmaps().then(function (gmaps) {
        var gmapBounds = services.utils.centerRadiusToBounds(selection.center.lat, selection.center.lng, selection.radius, gmaps),
            twitterBounds = services.utils.boundsToTwitterString(gmapBounds);
        services.ws.getRemote().invoke('subscribeTwitterStream', {
            notify: 'streamResp',
            reqMethod: 'GET',
            reqUrl: 'https://stream.twitter.com/1.1/statuses/filter.json',
            reqData: {
                locations: twitterBounds,
                stall_warnings: 'true'
            }
        }).then(function (resp) {
            console.log('subscribe id:');
            console.log(resp);
            internals.requestId = resp;
            internals.visibleTweets.length = 0;
            internals.visibleTweets.length = 0;
            tweetFeedStore.emitFeedChange();
        }, function (err) {
            console.log(err);
        });
    });
};

var tweetFeedStore = _.create(EventEmitter.prototype, {
    events: eventNames,
    // эмитим не чаще 1 раза в 3 сек
    emitFeedChange: _.throttle(function () {
        console.log('TweetFeedStore emits CHANGE');
        this.emit(this.events.EVENT_FEED_CHANGE);
    }, 3000, {leading: true}),
    getVisibleTweets: function () {
        return internals.visibleTweets;
    },
    getHidedTweets: function () {
        return internals.hidedTweets;
    }
});

var processShowImmediateChanged = function () {
    dispatcher.waitFor([tweetFeedControlStore.dispatchToken]);
    internals.showImmediate = tweetFeedControlStore.getShowTweetsImmediate();
};

var processMapSelection = function () {
    var newSelection;
    dispatcher.waitFor([mapStore.dispatchToken]);
    newSelection = mapStore.getSelection();

    if (!newSelection) {
        return;
    }

    _.defer(onSelectionChanged, newSelection);
};

var actionHandler = function (payload) {
    switch (payload.actionType) {
        case actions.types.TWEET_FEED_CONTROL.SHOW_IMMEDIATE_CHANGED:
            processShowImmediateChanged();
            break;
        case actions.types.MAP.SELECTION_CENTER_CHANGED:
        case actions.types.MAP.SELECTION_RADIUS_CHANGED:
            console.log('TweetFeedStore catch ' + payload.actionType);
            processMapSelection();
            break;
        default:
        // nothing
    }
};

services.ws.localApi.streamResp = function (resp) {
    if (resp.tweet && resp.tweet.id) {
        // tweet really
        onTweetReceive(resp.tweet);
    } else if (resp.tweet && resp.tweet.message) {
        console.log({
            title: 'Twitter said:',
            content: resp.tweet.message,
            'class': 'toast-warning'
        });
    } else {
        console.log({
            title: 'Uknown response',
            content: JSON.stringify(resp)
        });
    }
    return 'OK';
};

tweetFeedStore.dispatchToken = dispatcher.register(actionHandler);

module.exports = tweetFeedStore;