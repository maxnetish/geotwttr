var libs = require('../libs'),
    dispatcher = libs.dispatcher,
    actionTypes = require('./action-types');

var geosearchTokenChanged = function (newToken) {
    var dispatchPayload = {
        actionType: actionTypes.GEOSEARCH.TOKEN_CHANGED,
        actionArgs: {
            token: newToken
        }
    };
    dispatcher.dispatch(dispatchPayload);
};

var geosearchSelectItem = function(item){
    var  dispatchPayload = {
        actionType: actionTypes.GEOSEARCH.SELECT_ITEM,
        actionArgs: {
            selectedItem: item
        }
    };
    dispatcher.dispatch(dispatchPayload);
};

module.exports = {
    geosearchTokenChanged: geosearchTokenChanged,
    geosearchSelectItem: geosearchSelectItem
};