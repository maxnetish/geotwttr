/**
 * Created by Gordeev on 14.03.2015.
 */
jest.dontMock('lodash');
jest.dontMock('../root-store');

describe('map-store', function () {
    var _, dispatcher, actions, store, dispatcherCallback, eventCallback, mapStore, selectionMockValue;

    beforeEach(function () {
        _ = require('lodash');

        // mock debounce/defer calls
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

        // mock mapStore.getSelection()
        mapStore = require('../map-store');
        selectionMockValue = {
            foo: 'bar'
        };
        mapStore.getSelection.mockReturnValue(selectionMockValue);

        dispatcher = require('../../dispatcher');
        actions = require('../../actions');
        store = require('../root-store');

        // mock dispatcher callback
        dispatcherCallback = dispatcher.register.mock.calls[0][0];
        eventCallback = jest.genMockFunction();
    });

    afterEach(function () {
        store.removeAllListeners();
    });

    it('after MAP.LOADED emit EVENT_MAP_LOADED and set mapLoaded', function () {
        store.on(store.events.EVENT_MAP_LOADED, eventCallback);
        dispatcherCallback({
            actionType: actions.types.MAP.LOADED,
            actionArgs: {}
        });

        expect(eventCallback.mock.calls.length).toBe(1);
        expect(store.getMapLoaded()).toBeTruthy();
    });

    it('after MAP.CLICK emit EVENT_MAP_SELECTION_CHANGED and set new selection and hasSelection', function(){
        store.on(store.events.EVENT_MAP_SELECTION_CHANGED, eventCallback);
        dispatcherCallback({
            actionType: actions.types.MAP.CLICK,
            actionArgs: null
        });

        expect(eventCallback).toBeCalled();
        expect(store.getMapSelection()).toEqual(selectionMockValue);
        expect(store.getMapHasSelection()).toBeTruthy();
    });

    it('after MAP.SELECTION_CENTER_CHANGED emit EVENT_MAP_SELECTION_CHANGED and set new selection and hasSelection', function(){
        store.on(store.events.EVENT_MAP_SELECTION_CHANGED, eventCallback);
        dispatcherCallback({
            actionType: actions.types.MAP.SELECTION_CENTER_CHANGED,
            actionArgs: null
        });

        expect(eventCallback).toBeCalled();
        expect(store.getMapSelection()).toEqual(selectionMockValue);
        expect(store.getMapHasSelection()).toBeTruthy();
    });

    it('after MAP.SELECTION_RADIUS_CHANGED should emit EVENT_MAP_SELECTION_CHANGED and set new selection', function(){
        store.on(store.events.EVENT_MAP_SELECTION_CHANGED, eventCallback);
        dispatcherCallback({
            actionType: actions.types.MAP.SELECTION_RADIUS_CHANGED,
            actionArgs: null
        });

        expect(eventCallback).toBeCalled();
        expect(store.getMapSelection()).toEqual(selectionMockValue);
    });
});