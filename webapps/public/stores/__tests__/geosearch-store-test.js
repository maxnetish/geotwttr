jest.dontMock('lodash');
jest.dontMock('../geosearch-store');
jest.dontMock('../../services/geosearch-result-item');

describe('geosearch-store', function () {
    var _, dispatcher, actions, store, dispatcherCallback, eventCallback, geocoder;

    var mockGeocodeSearchResult =
        [
            {
                value: 'first'
            },
            {
                value: 'second'
            }
        ];

    beforeEach(function () {
        _ = require('lodash');

        // mock debounce calls
        // mock debounce calls
        spyOn(_, 'debounce').andCallFake(function (func) {
            return function () {
                func.apply(this, arguments);
            };
        });
        spyOn(_, 'defer').andCallFake(function (func, args) {
            if (func) {
                return func.apply(this, args);
            }
        });
        spyOn(_, 'throttle').andCallFake(function(){
            return function () {
                func.apply(this, arguments);
            };
        });

        geocoder = require('../../services/geocoder');
        dispatcher = require('../../dispatcher');
        actions = require('../../actions');
        store = require('../geosearch-store');

        // mock dispatcher callback
        dispatcherCallback = dispatcher.register.mock.calls[0][0];
        eventCallback = jest.genMockFunction();

        // mock async geocoding - do sync
        geocoder.promiseGeocode.mockReturnValue({
            then: function (cb) {
                cb(mockGeocodeSearchResult);
            }
        });

    });

    afterEach(function () {
        store.removeAllListeners();
    });

    it('Should receive GEOSEARCH.TOKEN_CHANGED action and store new token', function () {
        var expectedToken = 'token 1';
        dispatcherCallback({
            actionType: actions.types.GEOSEARCH.TOKEN_CHANGED,
            actionArgs: {
                token: expectedToken
            }
        });
        expect(store.getSearchToken()).toEqual(expectedToken);
    });

    it('Should emit EVENT_TOKEN_CHANGED after GEOSEARCH.TOKEN_CHANGED action', function () {
        store.on(store.events.EVENT_TOKEN_CHANGED, eventCallback);
        dispatcherCallback({
            actionType: actions.types.GEOSEARCH.TOKEN_CHANGED,
            actionArgs: {
                token: 'bar'
            }
        });
        expect(eventCallback.mock.calls.length).toBe(1);
    });

    it('Should not emit EVENT_TOKEN_CHANGED if token not changed', function () {
        var myToken = 'token 3';
        dispatcherCallback({
            actionType: actions.types.GEOSEARCH.TOKEN_CHANGED,
            actionArgs: {
                token: myToken
            }
        });
        store.on(store.events.EVENT_TOKEN_CHANGED, eventCallback);
        dispatcherCallback({
            actionType: actions.types.GEOSEARCH.TOKEN_CHANGED,
            actionArgs: {
                token: myToken
            }
        });
        expect(eventCallback.mock.calls.length).toBe(0);
    });

    it('Should perform geocode search after update search token', function () {
        var result,
            myToken = 'token 4';

        dispatcherCallback({
            actionType: actions.types.GEOSEARCH.TOKEN_CHANGED,
            actionArgs: {
                token: myToken
            }
        });
        result = store.getSearchResults();
        expect(result.length).toBe(mockGeocodeSearchResult.length);
    });

    it('Should emit EVENT_SEARCH_RESULTS_CHANGED event after geocode search', function () {
        var myToken = 'token 5';
        store.on(store.events.EVENT_SEARCH_RESULTS_CHANGED, eventCallback);
        dispatcherCallback({
            actionType: actions.types.GEOSEARCH.TOKEN_CHANGED,
            actionArgs: {
                token: myToken
            }
        });
        expect(eventCallback.mock.calls.length).toBe(1);
    });

    it('Should clear search result and set token after GEOSEARCH.SELECT_ITEM (after select one of search results)', function () {
        var myFormattedAddress = 'My formatted address',
            resultList, resultToken;

        dispatcherCallback({
            actionType: actions.types.GEOSEARCH.SELECT_ITEM,
            actionArgs: {
                selectedItem: {
                    formatted_address: myFormattedAddress
                }
            }
        });

        resultList = store.getSearchResults();
        resultToken = store.getSearchToken();

        expect(resultList.length).toBe(0);
        expect(resultToken).toBe(myFormattedAddress);
    });
});
