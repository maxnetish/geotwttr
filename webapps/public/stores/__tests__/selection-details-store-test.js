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
                console.log('return mock promise.then:');
                console.log(result.then);
                // FIXME несмотря на то что возвращается резолвленный promise, коллбэки выполняются асинхронно!
                return result;
            });

            console.log('promise mock created:');
            console.log(opts.target[opts.fnName]);
        };

        mapStore = require('../map-store');
        mockSelection = {
            center: {
                lat: 1.234,
                lng: 2.345
            },
            radius: 1000
        };
        mapStore.getSelection.mockReturnValue(mockSelection);
        //promiseResolveFunctionMock = function (opts) {
        //    opts = opts || {
        //        target: null,
        //        fnName: '',
        //        deferAction: '',
        //        deferArg: null
        //    };
        //
        //    spyOn(opts.target, opts.fnName).andCallFake(function () {
        //        var dfr = Q.defer();
        //        dfr[opts.deferAction](opts.deferArg);
        //        return dfr.promise;
        //    });
        //};

        //spyOn(services.geocoder, 'promiseReverseGeocode').andCallFake(function(){
        //    var deferred = Q.defer();
        //    deferred.resolve('Result for resolve');
        //    return deferred.promise;
        //});

        //promiseResolveFunctionMock = function(promiseFn, resolveValue){
        //    var getResultValue = function(val) {
        //        return {
        //            then: function (cb) {
        //                var newVal;
        //                if (_.isFunction(cb)) {
        //                    newVal = cb(val);
        //                }
        //                return getResultValue(newVal);
        //            },
        //            'finally': function (cb) {
        //                if(_.isFunction(cb)){
        //                    cb();
        //                }
        //                return getResultValue(val);
        //            }
        //        };
        //    };
        //
        //    promiseFn.mockReturnValue(getResultValue(resolveValue));
        //};
        //services = require('../../services');
        //promiseResolveFunctionMock(services.geocoder.promiseReverseGeocode, {foo: 'bar'});

        services = require('../../services');
        dispatcher = require('../../dispatcher');
        actions = require('../../actions');
        store = require('../selection-details-store');

        // mock dispatcher callback
        dispatcherCallback = dispatcher.register.mock.calls[0][0];
        eventCallback = jest.genMockFunction();
        eventCallback.mockImplementation(function(){
            console.log('event callback execs');
        });
    });

    afterEach(function () {
        store.removeAllListeners();
    });

    it('After MAP.CLICK should emit EVENT_DETAILS_WAIT_TOGGLE twice and set detailsWait to false', function () {
        var myGeocode = {
            foo: 'geocode object'
        };
        var myCoords = [1.234, -5.678];

        promiseResolveFunctionMock({
            target: services.geocoder,
            fnName: 'promiseReverseGeocode',
            deferAction: 'resolve',
            deferArg: myGeocode
        });

        console.log('add listener');
        store.on(store.events.EVENT_DETAILS_WAIT_TOGGLE, eventCallback);
        console.log('call dispatcher callback');
        dispatcherCallback({
            actionType: actions.types.MAP.CLICK,
            actionArgs: {
                coords: myCoords
            }
        });
        console.log('now check expectations');

        expect(eventCallback.mock.calls.length).toBe(2);
        expect(store.getDetailsWait()).toBeFalsy();
    });

    xit('After MAP.CLICK should resolve geocode and emit EVENT_DETAILS_READY', function(){
        var myGeocode = {
            foo: 'geocode object'
        };
        var myCoords = [1.234, -5.678];

        promiseResolveFunctionMock({
            target: services.geocoder,
            fnName: 'promiseReverseGeocode',
            deferAction: 'resolve',
            deferArg: myGeocode
        });

        store.on(store.events.EVENT_DETAILS_READY, eventCallback);
        dispatcherCallback({
            actionType: actions.types.MAP.CLICK,
            actionArgs: {
                coords: myCoords
            }
        });

        expect(eventCallback).toBeCalled();
    });
});