var libs = require('../libs'),
    _ = libs._,
    EventEmitter = libs.EventEmitter,
    dispatcher = libs.dispatcher,
    actions = require('../actions'),
    services = require('../services');

var eventNames = Object.freeze({
    EVENT_FEED_CHANGE: 'event-feed-change'
});

var internals = {
    visibleTweets: [],
    hidedTweets: []
};

var tweetFeedStore = _.create(EventEmitter.prototype, {
    events: eventNames,
    emitFeedChange: function () {
        return this.emit(this.events.EVENT_FEED_CHANGE);
    },
    getVisibleTweets: function () {
        return internals.visibleTweets;
    },
    getHidedTweets: function(){
        return internals.hidedTweets;
    }
});

var actionHandler = function (payload) {
    switch (payload.actionType) {

        default:
        // nothing
    }
};

tweetFeedStore.dispatchToken = dispatcher.register(actionHandler);

module.exports = tweetFeedStore;