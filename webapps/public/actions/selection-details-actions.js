var
    dispatcher = require('../dispatcher'),
    actionTypes = require('./action-types');

var expandToggle = function(){
    var dispatcherPayload = {
        actionType: actionTypes.SELECTION_DETAILS.EXPAND_CLICK,
        actionArgs: null
    };
    dispatcher.dispatch(dispatcherPayload);
};

var detailLineClick = function(detailLineInfo){
    var dispatchPayload = {
        actionType: actionTypes.SELECTION_DETAILS.DETAIL_LINE_CLICK,
        actionArgs: {
            detailLineInfo: detailLineInfo
        }
    };
    dispatcher.dispatch(dispatchPayload);
};

module.exports = {
    expandToggle: expandToggle,
    detailLineClick: detailLineClick
};