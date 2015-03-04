jest.dontMock('lodash');
//jest.dontMock('flux');
jest.dontMock('../geosearch-store');

describe('geosearch-store', function () {
    var _, dispatcher, actions, store, dispatcherCallback, eventCallback, services, geocoder;

    beforeEach(function () {
        _ = require('lodash');
        spyOn(_, 'debounce').andCallFake(function (func) {
            console.log('creating fake function');
            return function () {
                console.log('exec fake debounced func');
                func.apply(this, arguments);
            };
        });
        services = require('../../services');
        dispatcher = require('../../dispatcher');
        actions = require('../../actions');
        store = require('../geosearch-store');
        dispatcherCallback = dispatcher.register.mock.calls[0][0];
        eventCallback = jest.genMockFunction();
        geocoder = services.geocoder;
        geocoder.promiseGeocode.mockReturnValue({
            then: function (cb) {
                cb([{
                    foo: 'bar'
                }]);
            }
        });
        //services.geosearchResultItem.GeocoderResultViewModel.mockImplementation(function (inp) {
        //    console.log('exec fake GeocoderResultViewModel ctor');
        //    this.foo2 = 'bar2';
        //});
    });

    afterEach(function () {
        store.removeAllListeners();
    });

    it('Should receive GEOSEARCH.TOKEN_CHANGED action and store new token', function () {
        dispatcherCallback({
            actionType: actions.types.GEOSEARCH.TOKEN_CHANGED,
            actionArgs: {
                token: 'token 1'
            }
        });
        expect(store.getSearchToken()).toEqual('token 1');
    });

    it('Should emit EVENT_TOKEN_CHANGED after GEOSEARCH.TOKEN_CHANGED action', function () {
        store.on(store.events.EVENT_TOKEN_CHANGED, eventCallback);
        dispatcherCallback({
            actionType: actions.types.GEOSEARCH.TOKEN_CHANGED,
            actionArgs: {
                token: 'token 2'
            }
        });
        expect(eventCallback.mock.calls.length).toBe(1);
    });

    it('Should not emit EVENT_TOKEN_CHANGED if token not changed', function () {
        dispatcherCallback({
            actionType: actions.types.GEOSEARCH.TOKEN_CHANGED,
            actionArgs: {
                token: 'token 3'
            }
        });
        store.on(store.events.EVENT_TOKEN_CHANGED, eventCallback);
        dispatcherCallback({
            actionType: actions.types.GEOSEARCH.TOKEN_CHANGED,
            actionArgs: {
                token: 'token 3'
            }
        });
        expect(eventCallback.mock.calls.length).toBe(0);
    });

    it('Should perform geocode search after update search token', function () {
        var flag;

        console.log('it calls');

        (_.debounce(function () {
            console.log('debounced spying call');
        }, 100))();


        dispatcherCallback({
            actionType: actions.types.GEOSEARCH.TOKEN_CHANGED,
            actionArgs: {
                token: 'token 4'
            }
        });

        console.log(geocoder.promiseGeocode.mock.calls.length);
        console.log(store.getSearchResults());
        expect(store.getSearchResults()).toEqual([{
            foo: 'bar'
        }]);

    });
});
