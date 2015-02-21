var libs = require('../libs'),
    dispatcher = libs.dispatcher,
    actionTypes = require('./action-types');

var showImmediateChanged = function (newValue) {
    var dispatchPayload = {
        actionType: actionTypes.TWEET_FEED_CONTROL.SHOW_IMMEDIATE_CHANGED,
        actionArgs: {
            showTweetsImmediate: !!newValue
        }
    };
    dispatcher.dispatch(dispatchPayload);
};

var wantShowNewTweets = function () {
    var dispatcherPayload = {
        actionType: actionTypes.TWEET_FEED_CONTROL.WANT_SHOW_NEW_TWEETS,
        actionArgs: {}
    };
    dispatcher.dispatch(dispatchPayload);
};

var wantResetTweets = function () {
    var dispatcherPayload = {
        actionType: actionTypes.TWEET_FEED_CONTROL.WANT_RESET_TWEETS,
        actionArgs: {}
    };
    dispatcher.dispatch(dispatchPayload);
};

module.exports = {
    showImmediateChanged: showImmediateChanged,
    wantShowNewTweets: wantShowNewTweets,
    wantResetTweets: wantResetTweets
};