var
    _ = require('lodash'),
    EventEmitter = require('events').EventEmitter,
    dispatcher = require('../dispatcher'),
    actions = require('../actions'),
    servicesGeocoder = require('../services/geocoder'),
    servicesGeosearchResult = require('../services/geosearch-result-item')
    ;

var eventNames = Object.freeze({
    EVENT_TOKEN_CHANGED: 'event-token-changed',
    EVENT_SEARCH_RESULTS_CHANGED: 'event-search-result-changed'
});

var internals = {
    searchToken: null,
    searchResults: [],
    selectedSearchResult: null
};

var geosearchsStore = _.create(EventEmitter.prototype, {
    events: eventNames,
    emitTokenChanged: function () {
        return this.emit(this.events.EVENT_TOKEN_CHANGED);
    },
    emitSearchResultChanged: function () {
        return this.emit(this.events.EVENT_SEARCH_RESULTS_CHANGED);
    },
    getSearchToken: function () {
        return internals.searchToken;
    },
    getSearchResults: function () {
        return internals.searchResults;
    },
    getSelectedSearchResult: function () {
        return internals.selectedSearchResult;
    }
});

var refreshSearchResultsDebounce = _.debounce(function () {
    if (internals.searchToken) {
        servicesGeocoder.promiseGeocode({address: internals.searchToken}).then(function (result) {
            if (result && result.length) {
                internals.searchResults = _.map(result, function (oneResult) {
                    var viewModel = servicesGeosearchResult.createViewModel(oneResult);
                    return viewModel;
                });
            } else {
                internals.searchResults = [];
            }
            geosearchsStore.emitSearchResultChanged();
        });
    } else {
        internals.searchResults = [];
        geosearchsStore.emitSearchResultChanged();
    }
}, 500);

var processTokenChanges = function (newToken) {
    if (newToken === internals.searchToken) {
        return;
    }
    internals.searchToken = newToken;
    refreshSearchResultsDebounce();
    geosearchsStore.emitTokenChanged();
};

var processSelectItem = function (item) {
    internals.searchResults = [];
    geosearchsStore.emitSearchResultChanged();
    internals.searchToken = item && item.formatted_address;
    geosearchsStore.emitTokenChanged();
};

var actionHandler = function (payload) {
    switch (payload.actionType) {
        case actions.types.GEOSEARCH.TOKEN_CHANGED:
            processTokenChanges(payload.actionArgs.token);
            break;
        case actions.types.GEOSEARCH.SELECT_ITEM:
            processSelectItem(payload.actionArgs.selectedItem);
            break;
        default:
        // nothing
    }
};

geosearchsStore.dispatchToken = dispatcher.register(actionHandler);

module.exports = geosearchsStore;