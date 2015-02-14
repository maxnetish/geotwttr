var libs = require('../libs'),
    dispatcher = libs.dispatcher,
    actionTypes = require('./action-types');

var click = function (coords) {
    var dispatcherPayload = {
        actionType: actionTypes.MAP.CLICK,
        actionArgs: {
            coords: coords
        }
    };
    dispatcher.dispatch(dispatcherPayload);
};

var selectionRadiusChanged = function (radius) {
    var dispatcherPayload = {
        actionType: actionTypes.MAP.SELECTION_RADIUS_CHANGED,
        actionArgs: {
            radius: radius
        }
    };
    dispatcher.dispatch(dispatcherPayload);
};

var selectionCenterChanged = function (coords) {
    var dispatcherPayload = {
        actionType: actionTypes.MAP.SELECTION_CENTER_CHANGED,
        actionArgs: {
            coords: coords
        }
    };
    dispatcher.dispatch(dispatcherPayload);
};

var centerChanged = function (coords) {
    var dispatcherPayload = {
        actionType: actionTypes.MAP.CENTER_CHANGED,
        actionArgs: {
            coords: coords
        }
    };
    dispatcher.dispatch(dispatcherPayload);
};

var zoomChanged = function (zoom) {
    var dispatcherPayload = {
        actionType: actionTypes.MAP.ZOOM_CHANGED,
        actionArgs: {
            zoom: zoom
        }
    };
    dispatcher.dispatch(dispatcherPayload);
};

var loaded = function(){
    var dispatcherPayload = {
        actionType: actionTypes.MAP.LOADED,
        actionArgs: null
    };
    dispatcher.dispatch(dispatcherPayload);
};

module.exports = {
    click: click,
    selectionRadiusChanged: selectionRadiusChanged,
    selectionCenterChanged: selectionCenterChanged,
    centerChanged: centerChanged,
    zoomChanged: zoomChanged,
    loaded: loaded
};