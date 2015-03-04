var
    _ = require('lodash'),
    EventEmitter = require('events').EventEmitter,
    dispatcher = require('../dispatcher'),
    actions = require('../actions'),
//searchMockData = require('../services/geocoder-results-mock-data'),
    services = require('../services');

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

//var refreshSearchResultsDebounce = function () {
//    console.log('exec refreshSearchResults not Debounce: ' + internals.searchToken);
//    if (internals.searchToken) {
//        services.geocoder.promiseGeocode({address: internals.searchToken}).then(function (result) {
//            console.log('got results: ' + result.length);
//            if (result && result.length) {
//                internals.searchResults = _.map(result, function (oneResult) {
//                    console.log(oneResult);
//                    console.log(new services.geosearchResultItem.GeocoderResultViewModel(oneResult));
//                    return new services.geosearchResultItem.GeocoderResultViewModel(oneResult);
//                });
//            } else {
//                internals.searchResults = [];
//            }
//            geosearchsStore.emitSearchResultChanged();
//        });
//    } else {
//        internals.searchResults = [];
//        geosearchsStore.emitSearchResultChanged();
//    }
//};

var refreshSearchResultsDebounce = _.debounce(function () {
    console.log('exec refreshSearchResultsDebounce: '+ internals.searchToken);
    if (internals.searchToken) {
        services.geocoder.promiseGeocode({address: internals.searchToken}).then(function (result) {
            if (result && result.length) {
                internals.searchResults = _.map(result, function (oneResult) {
                    console.log(oneResult);
                    console.log(new services.geosearchResultItem.GeocoderResultViewModel(oneResult));
                    console.log(services.geosearchResultItem.GeocoderResultViewModel);
                    return new services.geosearchResultItem.GeocoderResultViewModel(oneResult);
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
    console.log('processTokenChanges: ' + newToken);
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