var libs = require('../libs'),
    actions = require('../actions'),
    dispatcher = libs.dispatcher,
    EventEmitter = libs.EventEmitter,
    _ = libs._,
    services = require('../services');

var eventNames = Object.freeze({
    SELECTION_CHANGE: 'selection-change',
    CHANGE: 'change'
});

var selection = {
    center: {
        lat: 0,
        lng: 0
    },
    radius: 1000
};

var center = services.localStorage.read(services.localStorage.keys.CENTER, {
    lat: 37.419,
    lng: -122.080
});

var zoom = services.localStorage.read(services.localStorage.keys.ZOOM, 6);

var storeCenter = _.debounce(function () {
    services.localStorage.write(services.localStorage.keys.CENTER, center);
}, 1000);

var storeZoom = _.debounce(function () {
    services.localStorage.write(services.localStorage.keys.ZOOM, zoom);
}, 1000);

var mapStore = _.create(EventEmitter.prototype, {
    events: eventNames,
    emitSelectionChange: function () {
        console.log('mapStore emits selection-change event');
        return this.emit(this.events.SELECTION_CHANGE);
    },
    emitChange: _.debounce(function () {
        console.log('mapStore emits change event');
        return this.emit(this.events.CHANGE);
    }, 500),
    getCenter: function () {
        return center;
    },
    getZoom: function () {
        return zoom;
    },
    getSelection: function () {
        return selection;
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
    console.log('process zoom changed: ' + newZoom);
    if (newZoom === zoom) {
        return;
    }
    zoom = newZoom;
    storeZoom();
    mapStore.emitChange();
};

var actionHandler = function (payload) {
    console.log('selectionStore handles action');
    console.log(payload);
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
        default:
        // nothing
    }
};

mapStore.dispatchToken = dispatcher.register(actionHandler);

module.exports = mapStore;