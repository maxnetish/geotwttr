var
    _ = require('lodash'),
    EventEmitter = require('events').EventEmitter,
    dispatcher = require('../dispatcher'),
    actions = require('../actions'),
    services = require('../services');

var mapStore = require('./map-store');

var eventNames = Object.freeze({
    EVENT_MAP_LOADED: 'event-map-loaded',
    EVENT_MAP_SELECTION_CHANGED: 'event-map-selection-changed',
    EVENT_ALERTS_CHANGED: 'event-alerts-changed'
});

var internals = {
    mapLoaded: false,
    mapHasSelection: false,
    mapSelection: null,
    alerts: []
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
    emitAlertsChanged: function () {
        return this.emit(this.events.EVENT_ALERTS_CHANGED);
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
    getAlerts: function () {
        return internals.alerts;
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

function processAlertWarning(err) {
    internals.alerts.unshift(_.assign(err || {}, {
        id: _.uniqueId('alert-'),
        severity: 'warning'
    }));
    rootStore.emitAlertsChanged();
}

function processAlertMessage(message) {
    var newId = _.uniqueId('alert-');

    internals.alerts.unshift(_.assign(message || {}, {
        id: newId,
        severity: 'message'
    }));
    rootStore.emitAlertsChanged();

    // remove after 36 sec:
    _.delay(function () {
        _.remove(internals.alerts, function (oneAlert) {
            return oneAlert.id === newId;
        });
        rootStore.emitAlertsChanged();
    }, 36000);
}

function processRemoveAlert(alert) {
    _.remove(internals.alerts, function (oneAlert) {
        return oneAlert.id === alert.id;
    });
    rootStore.emitAlertsChanged();
}

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
        case actions.types.ALERT.WARNING:
            processAlertWarning(payload.actionArgs.error);
            break;
        case actions.types.ALERT.MESSAGE:
            processAlertMessage(payload.actionArgs.message);
            break;
        case actions.types.ALERT.REMOVE_ALERT:
            processRemoveAlert(payload.actionArgs.alert);
            break;
        default:
        // nothing
    }
};

rootStore.dispatchToken = dispatcher.register(actionHandler);

module.exports = rootStore;