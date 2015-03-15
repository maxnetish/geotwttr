jest.dontMock('lodash');
jest.dontMock('../selection-details-store');

describe('selection-details-store', function () {
    var _, dispatcher, actions, store, dispatcherCallback, eventCallback, promiseResolveFunctionMock, services;

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

        promiseResolveFunctionMock = function(promiseFn, resolveValue){
            var getResultValue = function(val) {
                return {
                    then: function (cb) {
                        var newVal;
                        if (_.isFunction(cb)) {
                            newVal = cb(val);
                        }
                        return getResultValue(newVal);
                    },
                    'finally': function (cb) {
                        if(_.isFunction(cb)){
                            cb();
                        }
                        return getResultValue(val);
                    }
                };
            };

            promiseFn.mockReturnValue(getResultValue(resolveValue));
        };
        services = require('../../services');
        promiseResolveFunctionMock(services.geocoder.promiseReverseGeocode, {foo: 'barr'});


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
        var myCoords = [1.234, -5.678];

        store.on(store.events.EVENT_DETAILS_WAIT_TOGGLE, eventCallback);
        dispatcherCallback({
            actionType: actions.types.MAP.CLICK,
            actionArgs: {
                coords: myCoords
            }
        });


        expect(eventCallback.mock.calls.length).toBe(2);
        expect(store.getDetailsWait()).toBeFalsy();
    });
});