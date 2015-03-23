var
    _ = require('lodash'),
    EventEmitter = require('events').EventEmitter,
    dispatcher = require('../dispatcher'),
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
    addingRate: 0,
    tweetProvider: new services.wsTweetProvider.Provider(),
    startTime: Date.now()
};

var updateAddingRate = function () {
    var milliseconds = Date.now() - internals.startTime;

    if (milliseconds === 0) {
        internals.addingRate = 0;
    } else {
        internals.addingRate = (60 * 1000 * (internals.visibleTweets.length + internals.hidedTweets.length)) / milliseconds;
    }
    tweetFeedStore.emitAddingRateChange();
};

var onTweetReceive = function (tw) {
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
        tweetFeedStore.emitFeedChange.cancel();
    }
    _.eachRight(internals.hidedTweets, function (hidedItem) {
        internals.visibleTweets.unshift(hidedItem);
    });
    internals.hidedTweets.length = 0;
    tweetFeedStore.emitFeedChange();
};

var resetTweets = function () {
    internals.visibleTweets.length = 0;
    internals.hidedTweets.length = 0;
    internals.startTime = Date.now();
    tweetFeedStore.emitFeedChange();
};

var tweetFeedStore = _.create(EventEmitter.prototype, {
    events: eventNames,
    // эмитим не чаще 1 раза в 3 сек
    emitFeedChange: _.throttle(function () {
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
    },
    getStartTime: function(){
        return internals.startTime;
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

    //retrieve new selection and check
    newSelection = mapStore.getSelection();
    if (!newSelection) {
        return;
    }

    // supress pendings Feed CHange events
    if (_.isFunction(tweetFeedStore.emitFeedChange.cancel)) {
        tweetFeedStore.emitFeedChange.cancel();
    }

    // reset visible, hided, start time
    resetTweets();

    _.defer(internals.tweetProvider.subscribe, {
        geoSelection: newSelection
    });
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
            processMapSelection();
            break;
        case actions.types.TWEET_FEED_CONTROL.WANT_SHOW_NEW_TWEETS:
            processShowHidedTweets();
            break;
        case actions.types.TWEET_FEED_CONTROL.WANT_RESET_TWEETS:
            processResetTweets();
            break;
        case actions.types.TWEET_PROVIDER.RECEIVE_TWEET:
            onTweetReceive(payload.actionArgs.tweet);
            break;
        default:
        // nothing
    }
};

tweetFeedStore.dispatchToken = dispatcher.register(actionHandler);

module.exports = tweetFeedStore;