var libs = require('../libs'),
    dispatcher = libs.dispatcher,
    actionTypes = require('./action-types');

var zoomChanged = function (zoom) {
    var dispatcherPayload = {
        actionType: actionTypes.MAP.ZOOM_CHANGED,
        actionArgs: {
            zoom: zoom
        }
    };
    dispatcher.dispatch(dispatcherPayload);
};

var expandToggle = function(){
    var dispatcherPayload = {
        actionType: actionTypes.SELECTION_DETAILS.EXPAND_CLICK,
        actionArgs: null
    };
    dispatcher.dispatch(dispatcherPayload);
};

module.exports = {
    expandToggle: expandToggle
};