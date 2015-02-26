var
    _ = require('lodash'),
    EventEmitter = require('events').EventEmitter,
    dispatcher = require('../dispatcher'),
    actions = require('../actions'),
    services = require('../services');

var mapStore = require('./map-store');

var eventNames = Object.freeze({
    EVENT_MAP_LOADED: 'event-map-loaded',
    EVENT_MAP_SELECTION_CHANGED: 'event-map-selection-changed'
});

var internals = {
    mapLoaded: false,
    mapHasSelection: false,
    mapSelection: null
};

var rootStore = _.create(EventEmitter.prototype, {
    events: eventNames,
    emitMapLoaded: function () {
        var self = this;
        _.defer(function () {
            return self.emit(self.events.EVENT_MAP_LOADED);
        });
    },
    emitMapSelectionChanged: function () {
        var self = this;
        _.defer(function () {
            return self.emit(self.events.EVENT_MAP_SELECTION_CHANGED);
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
};

var processMapSelectionRadiusChanges = function () {
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
        case actions.types.MAP.SELECTION_RADIUS_CHANGED:
            processMapSelectionRadiusChanges();
            break;
        default:
        // nothing
    }
};

rootStore.dispatchToken = dispatcher.register(actionHandler);

module.exports = rootStore;