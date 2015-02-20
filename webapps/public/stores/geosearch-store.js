var libs = require('../libs'),
    _ = libs._,
    EventEmitter = libs.EventEmitter,
    dispatcher = libs.dispatcher,
    actions = require('../actions'),
//searchMockData = require('../services/geocoder-results-mock-data'),
    services = require('../services');

var eventNames = Object.freeze({
    EVENT_TOKEN_CHANGED: 'event-token-changed',
    EVENT_SEARCH_RESULTS_CHANGED: 'event-search-result-changed',
    EVENT_SEARCH_RESULT_SELECTED: 'event-search-result-selected'
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
    emitSearchResultSelected: function(){
        return this.emit(this.events.EVENT_SEARCH_RESULT_SELECTED);
    },
    getSearchToken: function () {
        return internals.searchToken;
    },
    getSearchResults: function () {
        return internals.searchResults;
    },
    getSelectedSearchResult: function(){
        return internals.selectedSearchResult;
    }
});

var refreshSearchResultsDebounce = _.debounce(function () {
    if (internals.searchToken) {
        services.geocoder.promiseGeocode({address: internals.searchToken}).then(function (result) {
            if (result && result.length) {
                internals.searchResults = _.map(result, function (oneResult) {
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
    internals.searchToken = newToken;
    refreshSearchResultsDebounce();
    geosearchsStore.emitTokenChanged();
};

var processFormSubmit = function () {
    var searchToken = geosearchsStore.getSearchToken();

    if(searchToken) {
        services.geocoder.promiseGeocode({address: searchToken}).then(function (result) {
            if (result && result.length) {
                internals.selectedSearchResult = result[0];
                geosearchsStore.emitSearchResultSelected();
            }
        });
    }

    internals.searchResults = [];
    geosearchsStore.emitSearchResultChanged();
};

var processSelectItem = function(item){
    internals.searchResults = [];
    geosearchsStore.emitSearchResultChanged();
};

var actionHandler = function (payload) {
    switch (payload.actionType) {
        case actions.types.GEOSEARCH.TOKEN_CHANGED:
            processTokenChanges(payload.actionArgs.token);
            break;
        case actions.types.GEOSEARCH.FORM_SUBMIT:
            processFormSubmit();
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