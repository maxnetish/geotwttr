var
    dispatcher = require('../dispatcher'),
    actionTypes = require('./action-types');

function receiveTweet(tweet) {
    var dispatchPayload = {
        actionType: actionTypes.TWEET_PROVIDER.RECEIVE_TWEET,
        actionArgs: {
            tweet: tweet
        }
    };
    dispatcher.dispatch(dispatchPayload);
}

function receiveMessage(message) {
    var dispatchPayload = {
        actionType: actionTypes.TWEET_PROVIDER.RECEIVE_MESSAGE,
        actionArgs: {
            message: message
        }
    };
    dispatcher.dispatch(dispatchPayload);
}

function receiveError(err) {
    var dispatchPayload = {
        actionType: actionTypes.TWEET_PROVIDER.RECEIVE_ERROR,
        actionArgs: {
            error: err
        }
    };
    dispatcher.dispatch(dispatchPayload);
}

function unsubscribe(serverMessage){
    var dispatchPayload = {
        actionType: actionTypes.TWEET_PROVIDER.UNSUBSCRIBED,
        actionArgs: {
            message: serverMessage
        }
    };
    dispatcher.dispatch(dispatchPayload);
}

function subscribe(serverMessage){
    var dispatchPayload = {
        actionType: actionTypes.TWEET_PROVIDER.SUBSCRIBED,
        actionArgs: {
            message: serverMessage
        }
    };
    dispatcher.dispatch(dispatchPayload);
}

module.exports = {
    receiveTweet: receiveTweet,
    receiveMessage: receiveMessage,
    receiveError: receiveError,
    unsubscribe: unsubscribe,
    subscribe: subscribe
};