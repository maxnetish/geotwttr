var libs = require('../libs'),
    _ = libs._,
    EventEmitter = libs.EventEmitter,
    dispatcher = libs.dispatcher,
    actions = require('../actions'),
    services = require('../services');

var eventNames = Object.freeze({
    EVENT_TOKEN_CHANGED: 'event-token-changed'
});

var internals = {
    searchToken: null
};

var geosearchsStore = _.create(EventEmitter.prototype, {
    events: eventNames,
    emitTokenChanged: function () {
        return this.emit(this.events.EVENT_TOKEN_CHANGED);
    },
    getSearchToken: function () {
        return internals.searchToken;
    }
});

var processTokenChanges = function(newToken){
    if(newToken === internals.searchToken){
        return;
    }
    internals.searchToken = newToken;
    geosearchsStore.emitTokenChanged();
};

var actionHandler = function (payload) {
    switch (payload.actionType) {
        case actions.types.GEOSEARCH.TOKEN_CHANGED:
            processTokenChanges(payload.actionArgs.token);
            break;
        default:
        // nothing
    }
};

geosearchsStore.dispatchToken = dispatcher.register(actionHandler);

module.exports = geosearchsStore;