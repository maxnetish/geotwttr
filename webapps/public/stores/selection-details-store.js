var libs = require('../libs'),
    _ = libs._,
    EventEmitter = libs.EventEmitter,
    dispatcher = libs.dispatcher,
    actions = require('../actions'),
    services = require('../services');

var mapStore = require('./map-store');

var eventNames = Object.freeze({
    EVENT_EXPAND_TOGGLE: 'event-expand-toggle',
    EVENT_DETAILS_WAIT_TOGGLE: 'event-wait-toggle',
    EVENT_DETAILS_READY: 'event-details-ready',
    EVENT_RADIUS_CHANGED: 'event-radius-changed'
});

var internals = {
    detailsExpanded: false,
    details: [],
    detailsWait: false,
    selectionRadius: null
};

var selectionDetailsStore = _.create(EventEmitter.prototype, {
    events: eventNames,
    emitDetailsExpanded: function () {
        return this.emit(this.events.EVENT_EXPAND_TOGGLE);
    },
    emitWait: function () {
        return this.emit(this.events.EVENT_DETAILS_WAIT_TOGGLE);
    },
    emitDetailsReady: function () {
        return this.emit(this.events.EVENT_DETAILS_READY);
    },
    emitSelectionRadiusChanged: function () {
        return this.emit(this.events.EVENT_RADIUS_CHANGED);
    },
    getDetailsExpanded: function () {
        return internals.detailsExpanded;
    },
    getDetails: function () {
        return internals.details;
    },
    getDetailsWait: function () {
        return internals.detailsWait;
    },
    getSelectionRadius: function () {
        return internals.selectionDetails;
    }
});

var processExpandedToggle = function () {
    internals.detailsExpanded = !internals.detailsExpanded;
    selectionDetailsStore.emitDetailsExpanded();
};

var processSelectionChanges = function () {
    var selection;
    dispatcher.waitFor([mapStore.dispatchToken]);
    selection = mapStore.getSelection();

    // update selectionDetails
    if (selection) {
        internals.detailsWait = true;
        selectionDetailsStore.emitWait();
        services.geocoder.promiseReverseGeocode({
            lat: selection.center.lat,
            lng: selection.center.lng
        }).then(function (geocoderResult) {
            internals.details = geocoderResult;
            selectionDetailsStore.emitDetailsReady();
        })['finally'](function () {
            internals.detailsWait = false;
            selectionDetailsStore.emitWait();
        });
    }
};

var processSelectionRadiusChanges = function () {
    var selection;
    dispatcher.waitFor([mapStore.dispatchToken]);
    selection = mapStore.getSelection();
    internals.selectionRadius = selection.radius;
    selectionDetailsStore.emitSelectionRadiusChanged();
};

var actionHandler = function (payload) {
    switch (payload.actionType) {
        case actions.types.MAP.CLICK:
        case actions.types.MAP.SELECTION_CENTER_CHANGED:
            processSelectionChanges();
            break;
        case actions.types.MAP.SELECTION_RADIUS_CHANGED:
            processSelectionRadiusChanges();
            break;
        case actions.types.SELECTION_DETAILS.EXPAND_CLICK:
            processExpandedToggle();
            break;
        default:
        // nothing
    }
};

selectionDetailsStore.dispatchToken = dispatcher.register(actionHandler);

module.exports = selectionDetailsStore;