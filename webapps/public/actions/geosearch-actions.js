var libs = require('../libs'),
    dispatcher = libs.dispatcher,
    actionTypes = require('./action-types');

var geosearchTokenChanged = function(newToken){
    var dispatchPayload = {
        actionType: actionTypes.GEOSEARCH.TOKEN_CHANGED,
        actionArgs: {
            token: newToken
        }
    };
    dispatcher.dispatch(dispatchPayload);
};

module.exports = {
    geosearchTokenChanged: geosearchTokenChanged
};