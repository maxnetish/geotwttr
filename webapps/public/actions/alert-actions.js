var
    _ = require('lodash'),
    dispatcher = require('../dispatcher'),
    actionTypes = require('./action-types');

function removeAlert (alert) {
    var dispatchPayload = {
        actionType: actionTypes.ALERT.REMOVE_ALERT,
        actionArgs: {
            alert: alert
        }
    };
    dispatcher.dispatch(dispatchPayload);
}

function addMessage (message){
    var alert = {};
    alert.title = message.title || 'Something strange';
    alert.text = message.text || message || 'Something happens';

    var dispatchPayload = {
        actionType: actionTypes.ALERT.MESSAGE,
        actionArgs: {
            message: alert
        }
    };
    dispatcher.dispatch(dispatchPayload);
}

function addWarning (err){
    var alert = {
        title: err.title || 'There is something wrong',
        text: JSON.stringify(err, null, 4)
    };
    var dispatchPayload = {
        actionType: actionTypes.ALERT.WARNING,
        actionArgs: {
            error: alert
        }
    };
    dispatcher.dispatch(dispatchPayload);
}

module.exports = {
    removeAlert: removeAlert,
    addMessage: addMessage,
    addWarning: addWarning
};