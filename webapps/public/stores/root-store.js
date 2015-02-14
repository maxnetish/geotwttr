var libs = require('../libs'),
    _ = libs._,
    EventEmitter = libs.EventEmitter,
    dispatcher = libs.dispatcher,
    actions = require('../actions'),
    services = require('../services');

var mapStore = require('./map-store');

var EVENT_MAP_LOADED = 'event-map-loaded',
    EVENT_MAP_SELECTION_CHANGED = 'event-map-selection-changed',
    EVENT_MAP_SELECTION_DETAILS_CHANGED = 'event-map-selection-details-changed';

var internals = {
    mapLoaded: false,
    mapHasSelection: false,
    mapSelection: null,
    selectionDetails: null
};

var rootStore = _.create(EventEmitter.prototype, {
    emitMapLoaded: function () {
        var self = this;
        _.defer(function () {
            return self.emit(EVENT_MAP_LOADED);
        });
    },
    emitMapSelectionChanged: function () {
        var self = this;
        _.defer(function () {
            return self.emit(EVENT_MAP_SELECTION_CHANGED);
        });
    },
    emitMapSelectionDetailsChanged: function () {
        var self = this;
        _.defer(function () {
            return self.emit(EVENT_MAP_SELECTION_DETAILS_CHANGED);
        });
    },
    getMapLoaded: function () {
        return internals.mapLoaded;
    },
    getMapHasSelection: function () {
        return internals.mapHasSelection;
    },
    getMapSelection: function () {
        return internals.selection;
    },
    getSelectionDetails: function () {
        return internals.selectionDetails;
    },
    addMapLoadedListener: function (cb) {
        return this.on(EVENT_MAP_LOADED, cb);
    },
    removeMapLoadedListener: function (cb) {
        return this.removeListener(EVENT_MAP_LOADED, cb);
    },
    addMapSelectionChangedListener: function (cb) {
        return this.on(EVENT_MAP_SELECTION_CHANGED, cb);
    },
    removeMapSelectionChangedListener: function (cb) {
        return this.removeListener(EVENT_MAP_SELECTION_CHANGED, cb);
    },
    addMapSelectionDetailsChangedListener: function(cb){
        return this.on(EVENT_MAP_SELECTION_DETAILS_CHANGED, cb);
    },
    removeMapSelectionDetailsChangedListener: function(cb){
        return this.removeListener(EVENT_MAP_SELECTION_DETAILS_CHANGED, cb);
    }
});

var processMapLoaded = function () {
    if (internals.mapLoaded) {
        // nothing changed
        return;
    }
    internals.mapLoaded = true;
    rootStore.emitMapLoaded();
};

var processMapSelectionChanges = function () {
    var selection;
    dispatcher.waitFor([mapStore.dispatchToken]);
    selection = mapStore.getSelection();
    internals.selection = selection;
    internals.mapHasSelection = true;
    rootStore.emitMapSelectionChanged();

    // update selectionDetails
    if (selection) {
        services.geocoder.promiseReverseGeocode({
            lat: selection.center.lat,
            lng: selection.center.lng
        }).then(function(geocoderResult){
            internals.selectionDetails = geocoderResult;
            rootStore.emitMapSelectionDetailsChanged();
        });
    } else {
        internals.selectionDetails = null;
        rootStore.emitMapSelectionDetailsChanged();
    }
};

var processMapSelectionZoomChanges = function () {
    var selection;
    dispatcher.waitFor([mapStore.dispatchToken]);
    selection = mapStore.getSelection();
    internals.selection = selection;
    rootStore.emitMapSelectionChanged();
};

var actionHandler = function (payload) {
    switch (payload.actionType) {
        case actions.types.MAP.LOADED:
            processMapLoaded();
            break;
        case actions.types.MAP.CLICK:
        case actions.types.MAP.SELECTION_CENTER_CHANGED:
            processMapSelectionChanges();
            break;
        case actions.types.MAP.ZOOM_CHANGED:
            processMapSelectionZoomChanges();
            break;
        default:
        // nothing
    }
};

rootStore.dispatchToken = dispatcher.register(actionHandler);

module.exports = rootStore;