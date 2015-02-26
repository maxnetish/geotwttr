jest.dontMock('lodash');
jest.dontMock('../geosearch-store');

describe('Stores. ', function () {
    describe('geosearch-store', function () {
        it('Should exists mapStore', function () {
            var store = require('../geosearch-store');
            expect(store.dispatchToken).toBe(1);
        });

        it('Should receive "action-search-token-changed" action and generate event "event-token-changed"', function(){
            var
                store = require('../geosearch-store'),
                actions = require('../../actions'),
                newToken = 'new-token',
                callback = jest.genMockFunction();

            store.on(store.events.EVENT_TOKEN_CHANGED, callback);
            actions.geosearch.geosearchTokenChanged(newToken);
            expect(callback.mock.calls.length).toBe(1);
        });
    });
});
