var libs = require('../libs'),
    dispatcher = libs.dispatcher,
    actionTypes = require('./action-types');

var placeClick = function (twitterPlace) {
    var dispatchPayload = {
        actionType: actionTypes.TWEET.PLACE_CLICK,
        actionArgs: {
            twitterPlace: twitterPlace
        }
    };
    dispatcher.dispatch(dispatchPayload);
};

var coordsClick = function (coords) {
    var dispatchPayload = {
        actionType: actionTypes.TWEET.COORDS_CLICK,
        actionArgs: {
            coords: coords
        }
    };
    dispatcher.dispatch(dispatchPayload);
};

module.exports = {
    placeClick: placeClick,
    coordsClick: coordsClick
};