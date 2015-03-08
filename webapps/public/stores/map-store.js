var
    actions = require('../actions'),
    dispatcher = require('../dispatcher'),
    EventEmitter = require('events').EventEmitter,
    _ = require('lodash'),
    localStorage = require('../services/local-storage');

var geosearchStore = require('./geosearch-store');

var eventNames = Object.freeze({
    SELECTION_CHANGE: 'selection-change',
    CHANGE: 'change',
    SELECTION_AREA_CHANGE: 'selection-area-change'
});

var selection = {
    center: {
        lat: 0,
        lng: 0
    },
    radius: 1000
};

var center = localStorage.read(localStorage.keys.CENTER, {
    lat: 37.419,
    lng: -122.080
});

var zoom = localStorage.read(localStorage.keys.ZOOM, 6);

var areaSelection = {
    geocoderResult: null,
    twitterPlace: null,
    twitterCoords: null
};

var storeCenter = _.debounce(function () {
    localStorage.write(localStorage.keys.CENTER, center);
}, 1000);

var storeZoom = _.debounce(function () {
    localStorage.write(localStorage.keys.ZOOM, zoom);
}, 1000);

var mapStore = _.create(EventEmitter.prototype, {
    events: eventNames,
    emitSelectionChange: function () {
        return this.emit(this.events.SELECTION_CHANGE);
    },
    emitChange: _.debounce(function () {
        return this.emit(this.events.CHANGE);
    }, 500),
    emitChangeAreaSelection: function () {
        this.emit(this.events.SELECTION_AREA_CHANGE);
    },
    getCenter: function () {
        return center;
    },
    getZoom: function () {
        return zoom;
    },
    getSelection: function () {
        return selection;
    },
    getAreaSelection: function () {
        return areaSelection;
    }
});

var processMapClick = function (coords) {
    if (selection.center.lat === coords.lat && selection.center.lng === coords.lng) {
        // nothing changed
        return;
    }
    selection.center.lat = coords.lat || 0;
    selection.center.lng = coords.lng || 0;
    mapStore.emitSelectionChange();

    areaSelection.geocoderResult = null;
    areaSelection.twitterCoords = null;
    areaSelection.twitterPlace = null;
    mapStore.emitChangeAreaSelection();
};

var processRadiusChanged = function (radius) {
    if (selection.radius === radius) {
        return;
    }
    selection.radius = radius;
    mapStore.emitSelectionChange();
};

var processSelectionCenterChanged = function (coords) {
    if (selection.center.lat === coords.lat && selection.center.lng === coords.lng) {
        return;
    }
    selection.center.lat = coords.lat || 0;
    selection.center.lng = coords.lng || 0;
    mapStore.emitSelectionChange();

    areaSelection.geocoderResult = null;
    areaSelection.twitterCoords = null;
    areaSelection.twitterPlace = null;
    mapStore.emitChangeAreaSelection();
};

var processCenterChanged = function (coords) {
    if (center.lat === coords.lat && center.lng === coords.lng) {
        return;
    }
    center.lat = coords.lat || 0;
    center.lng = coords.lng || 0;
    storeCenter();
    mapStore.emitChange();
};

var processZoomChanged = function (newZoom) {
    if (newZoom === zoom) {
        return;
    }
    zoom = newZoom;
    storeZoom();
    mapStore.emitChange();
};

var processSelectionDetailLineClick = function (lineInfo) {
    areaSelection.geocoderResult = lineInfo;
    areaSelection.twitterCoords = null;
    areaSelection.twitterPlace = null;
    mapStore.emitChangeAreaSelection();
};

var processSearchResultSelected = function (selectedResult) {
    if (!selectedResult) {
        return;
    }

    areaSelection.geocoderResult = selectedResult;
    areaSelection.twitterCoords = null;
    areaSelection.twitterPlace = null;
    mapStore.emitChangeAreaSelection();
    //
    //center.lat = selectedResult.geometry.location.lat();
    //center.lng = selectedResult.geometry.location.lng();
    //storeCenter();
    //mapStore.emitChange();
};

var processTweetPlaceClick = function (twitterPlace) {
    twitterPlace = twitterPlace || {};
    if (areaSelection.twitterPlace && areaSelection.twitterPlace.id === twitterPlace.id) {
        return;
    }

    areaSelection.twitterPlace = twitterPlace;
    areaSelection.geocoderResult = null;
    areaSelection.twitterCoords = null;
    mapStore.emitChangeAreaSelection();
};

var processTweetCoordsClick = function (twitterCoords) {
    if(areaSelection.twitterCoords && areaSelection.twitterCoords[0]===twitterCoords[0] && areaSelection.twitterCoords[1] === twitterCoords[1]){
        return;
    }

    areaSelection.twitterCoords = twitterCoords;
    areaSelection.twitterPlace = null;
    areaSelection.geocoderResult = null;
    mapStore.emitChangeAreaSelection();
};

var actionHandler = function (payload) {
    switch (payload.actionType) {
        case actions.types.MAP.CLICK:
            processMapClick(payload.actionArgs.coords);
            break;
        case actions.types.MAP.SELECTION_RADIUS_CHANGED:
            processRadiusChanged(payload.actionArgs.radius);
            break;
        case actions.types.MAP.SELECTION_CENTER_CHANGED:
            processSelectionCenterChanged(payload.actionArgs.coords);
            break;
        case actions.types.MAP.CENTER_CHANGED:
            processCenterChanged(payload.actionArgs.coords);
            break;
        case actions.types.MAP.ZOOM_CHANGED:
            processZoomChanged(payload.actionArgs.zoom);
            break;
        case actions.types.SELECTION_DETAILS.DETAIL_LINE_CLICK:
            processSelectionDetailLineClick(payload.actionArgs.detailLineInfo);
            break;
        case actions.types.GEOSEARCH.SELECT_ITEM:
            processSearchResultSelected(payload.actionArgs.selectedItem);
            break;
        case actions.types.TWEET.PLACE_CLICK:
            processTweetPlaceClick(payload.actionArgs.twitterPlace);
            break;
        case actions.types.TWEET.COORDS_CLICK:
            processTweetCoordsClick(payload.actionArgs.coords);
            break;
        default:
        // nothing
    }
};

mapStore.dispatchToken = dispatcher.register(actionHandler);

module.exports = mapStore;