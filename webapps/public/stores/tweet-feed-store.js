var libs = require('../libs'),
    _ = libs._,
    EventEmitter = libs.EventEmitter,
    dispatcher = libs.dispatcher,
    actions = require('../actions'),
    services = require('../services');

var tweetFeedControlStore = require('./tweet-feed-control-store'),
    mapStore = require('./map-store');

var eventNames = Object.freeze({
    EVENT_FEED_CHANGE: 'event-feed-change',
    EVENT_ADDING_RATE_CHANGE: 'event-feed-adding-rate-change'
});

var internals = {
    visibleTweets: [],
    hidedTweets: [],
    requestId: null,
    addingRate: 0
};

var addingRateStartTime = Date.now();
var updateAddingRate = function () {
    var milliseconds = Date.now() - addingRateStartTime;

    if (milliseconds === 0) {
        internals.addingRate = 0;
    } else {
        internals.addingRate = (60 * 1000 * (internals.visibleTweets.length + internals.hidedTweets.length)) / milliseconds;
    }
    tweetFeedStore.emitAddingRateChange();
};

var onTweetReceive = function (tw) {
    console.log('TweetFeedStore receive tweet ' + tw.id_str);
    var showImmediate = tweetFeedControlStore.getShowTweetsImmediate();
    var tweetViewModelInstance = services.tweetViewModel.create(tw);
    if (showImmediate) {
        internals.visibleTweets.unshift(tweetViewModelInstance);
    } else {
        internals.hidedTweets.unshift(tweetViewModelInstance);
    }
    updateAddingRate();
    tweetFeedStore.emitFeedChange();
};

var makeAllVisible = function () {
    if (_.isFunction(tweetFeedStore.emitFeedChange.cancel)) {
        console.log('cancel deferred emitFeedChange');
        tweetFeedStore.emitFeedChange.cancel();
    }
    _.each(internals.hidedTweets, function (hidedItem) {
        internals.visibleTweets.unshift(hidedItem);
    });
    internals.hidedTweets.length = 0;
    tweetFeedStore.emitFeedChange();
};

var resetTweets = function () {
    internals.visibleTweets.length = 0;
    internals.hidedTweets.length = 0;
    addingRateStartTime = Date.now();
    tweetFeedStore.emitFeedChange();
};

var onSelectionChanged = function (selection) {
    if (_.isFunction(tweetFeedStore.emitFeedChange.cancel)) {
        console.log('cancel deferred emitFeedChange');
        tweetFeedStore.emitFeedChange.cancel();
    }

    resetTweets();

    if (internals.requestId) {
        services.ws.getRemote().invoke('unsubscribeTwitterStream', internals.requestId).then(function (res) {
            console.log('unsubscribe response: ' + res);
        });
        internals.requestId = null; // from this moment we won't receive from closing stream -> wait new stream
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
            addingRateStartTime = Date.now();
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
    emitAddingRateChange: _.throttle(function(){
        this.emit(this.events.EVENT_ADDING_RATE_CHANGE);
    }, 5000, {leading: true}),
    getVisibleTweets: function () {
        return internals.visibleTweets;
    },
    getHidedTweets: function () {
        return internals.hidedTweets;
    },
    getAddingRate: function () {
        return internals.addingRate;
    }
});

var processShowImmediateChanged = function () {
    var showImmediate;
    dispatcher.waitFor([tweetFeedControlStore.dispatchToken]);
    showImmediate = tweetFeedControlStore.getShowTweetsImmediate();
    if (showImmediate) {
        makeAllVisible();
    }
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

var processShowHidedTweets = function () {
    _.defer(makeAllVisible);
};

var processResetTweets = function () {
    _.defer(resetTweets);
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
        case actions.types.TWEET_FEED_CONTROL.WANT_SHOW_NEW_TWEETS:
            processShowHidedTweets();
            break;
        case actions.types.TWEET_FEED_CONTROL.WANT_RESET_TWEETS:
            processResetTweets();
            break;
        default:
        // nothing
    }
};

services.ws.localApi.streamResp = function (resp) {
    if (resp.tweet && resp.tweet.id && resp.id === internals.requestId) {
        // supress 'not our' response and
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