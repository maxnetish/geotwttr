var libs = require('../libs'),
    _ = libs._,
    EventEmitter = libs.EventEmitter,
    dispatcher = libs.dispatcher,
    actions = require('../actions'),
    services = require('../services');

var eventNames = Object.freeze({
    EVENT_SHOW_IMMEDIATE_TOGGLE: 'event-show-immediate-toggle'
});

var internals = {
    showTweetsImmediate: true
};

var tweetFeedControlStore = _.create(EventEmitter.prototype, {
    events: eventNames,
    emitShowImmediateToggle: function () {
        return this.emit(this.events.EVENT_SHOW_IMMEDIATE_TOGGLE);
    },
    getShowTweetsImmediate: function () {
        return internals.showTweetsImmediate;
    }
});

var processShowImmediateToggle = function (newValue) {
    if(newValue === internals.showTweetsImmediate){
        return;
    }

    internals.showTweetsImmediate = newValue;
    tweetFeedControlStore.emitShowImmediateToggle();
};

var actionHandler = function (payload) {
    switch (payload.actionType) {
        case actions.types.TWEET_FEED_CONTROL.SHOW_IMMEDIATE_CHANGED:
            processShowImmediateToggle(payload.actionArgs.showTweetsImmediate);
            break;
        default:
        // nothing
    }
};

tweetFeedControlStore.dispatchToken = dispatcher.register(actionHandler);

module.exports = tweetFeedControlStore;