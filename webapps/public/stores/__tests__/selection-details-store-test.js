jest.dontMock('lodash');
jest.dontMock('q');
//jest.dontMock('../../services');
jest.dontMock('../selection-details-store');

describe('selection-details-store', function () {
    var _, dispatcher, actions, store, dispatcherCallback, eventCallback, services, Q, promiseResolveFunctionMock, mapStore, mockSelection;

    beforeEach(function () {
        _ = require('lodash');

        // mock debounce calls
        spyOn(_, 'debounce').andCallFake(function (func) {
            return function () {
                func.apply(this, arguments);
            };
        });
        spyOn(_, 'defer').andCallFake(function () {
            var argsArray = Array.prototype.slice.call(arguments);
            var func = argsArray.length ? argsArray[0] : undefined;
            var funcArgs = argsArray.length > 1 ? argsArray.slice(1) : [];

            if (func) {
                return func.apply(this, funcArgs);
            }
        });

        // mock geocoder service
        Q = require('q');
        promiseResolveFunctionMock = function (opts) {
            opts = opts || {
                target: null,
                fnName: '',
                deferAction: '',
                deferArg: null
            };
            opts.target[opts.fnName].mockImplementation(function () {
                var dfr = Q.defer(), result;
                dfr[opts.deferAction](opts.deferArg);
                result = dfr.promise;
                return result;
            });
        };

        // mock mapStore
        mapStore = require('../map-store');
        mockSelection = {
            center: {
                lat: 1.234,
                lng: 2.345
            },
            radius: 1000
        };
        mapStore.getSelection.mockReturnValue(mockSelection);

        services = require('../../services');
        dispatcher = require('../../dispatcher');
        actions = require('../../actions');
        store = require('../selection-details-store');

        // mock dispatcher callback
        dispatcherCallback = dispatcher.register.mock.calls[0][0];
        eventCallback = jest.genMockFunction();
    });

    afterEach(function () {
        store.removeAllListeners();
    });

    it('After MAP.CLICK should emit EVENT_DETAILS_WAIT_TOGGLE twice and set detailsWait to false', function () {
        var myGeocode = {
            foo: 'geocode object'
        };

        promiseResolveFunctionMock({
            target: services.geocoder,
            fnName: 'promiseReverseGeocode',
            deferAction: 'resolve',
            deferArg: myGeocode
        });

        runs(function () {
            store.on(store.events.EVENT_DETAILS_WAIT_TOGGLE, eventCallback);
            dispatcherCallback({
                actionType: actions.types.MAP.CLICK,
                actionArgs: null
            });
        });

        waitsFor(function () {
            return eventCallback.mock.calls.length === 2;
        }, 'Event callback not called twice during 200ms', 200);

        runs(function () {
            expect(eventCallback.mock.calls.length).toBe(2);
            expect(store.getDetailsWait()).toBeFalsy();
        });
    });

    it('After MAP.CLICK should resolve geocode and emit EVENT_DETAILS_READY', function () {
        var myGeocode = {
            foo: 'geocode object'
        };

        promiseResolveFunctionMock({
            target: services.geocoder,
            fnName: 'promiseReverseGeocode',
            deferAction: 'resolve',
            deferArg: myGeocode
        });

        runs(function () {
            store.on(store.events.EVENT_DETAILS_READY, eventCallback);
            dispatcherCallback({
                actionType: actions.types.MAP.CLICK,
                actionArgs: null
            });
        });

        waitsFor(function () {
            return eventCallback.mock.calls.length > 0;
        }, 'Event callback not called during 200 ms', 200);

        runs(function () {
            expect(eventCallback).toBeCalled();
            expect(store.getDetails()).toEqual(myGeocode);
        });
    });

    it('After MAP.CLICK should not emit EVENT_DETAILS_READY (and emit EVENT_DETAILS_WAIT_TOGGLE twice) if geocoding not success', function () {
        var detailsWaitCallbak = jest.genMockFunction();

        promiseResolveFunctionMock({
            target: services.geocoder,
            fnName: 'promiseReverseGeocode',
            deferAction: 'reject',
            deferArg: 'mock error'
        });

        runs(function () {
            store.on(store.events.EVENT_DETAILS_WAIT_TOGGLE, detailsWaitCallbak);
            store.on(store.events.EVENT_DETAILS_READY, eventCallback);
            dispatcherCallback({
                actionType: actions.types.MAP.CLICK,
                actionArgs: null
            });
        });

        waitsFor(function () {
            return detailsWaitCallbak.mock.calls.length === 2;
        }, 'detailsWaitCallbak not called twice', 200);

        runs(function () {
            expect(detailsWaitCallbak.mock.calls.length).toBe(2);
            expect(eventCallback.mock.calls.length).toBeFalsy();
        });
    });

    it('After MAP.SELECTION_RADIUS_CHANGED emit EVENT_RADIUS_CHANGED and set new radius', function () {

        store.on(store.events.EVENT_RADIUS_CHANGED, eventCallback);
        dispatcherCallback({
            actionType: actions.types.MAP.SELECTION_RADIUS_CHANGED,
            actionArgs: null
        });

        expect(eventCallback).toBeCalled();
        expect(store.getSelectionRadius()).toEqual(mockSelection.radius);
    });

    it('After SELECTION_DETAILS.EXPAND_CLICK emit EVENT_EXPAND_TOGGLE and toggle getDetailsExpanded()', function(){
        var initialVal = !!store.getDetailsExpanded();

        store.on(store.events.EVENT_EXPAND_TOGGLE, eventCallback);
        dispatcherCallback({
            actionType: actions.types.SELECTION_DETAILS.EXPAND_CLICK,
            actionArgs: null
        });

        expect(eventCallback).toBeCalled();
        expect(store.getDetailsExpanded()).toBe(!initialVal);

        eventCallback.mockClear();
        dispatcherCallback({
            actionType: actions.types.SELECTION_DETAILS.EXPAND_CLICK,
            actionArgs: null
        });

        expect(eventCallback).toBeCalled();
        expect(store.getDetailsExpanded()).toBe(initialVal);
    })
});