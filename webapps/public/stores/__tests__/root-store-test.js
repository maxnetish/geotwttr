/**
 * Created by Gordeev on 14.03.2015.
 */
jest.dontMock('lodash');
jest.dontMock('../root-store');

describe('root-store', function () {
    var _, dispatcher, actions, store, dispatcherCallback, eventCallback, mapStore, selectionMockValue;

    beforeEach(function () {
        _ = require('lodash');

        // mock debounce/defer calls
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

    it('after ALERT.WARNING should emit EVENT_WARNING and set warning', function(){
        var mockWarning = {
            error: {
                foo: 'bar'
            }
        };
        store.on(store.events.EVENT_WARNING, eventCallback);
        dispatcherCallback({
            actionType: actions.types.ALERT.WARNING,
            actionArgs: mockWarning
        });

        expect(eventCallback).toBeCalled();
        expect(store.getWarning()).toEqual(mockWarning.error);
    });

    it('after ALERT.MESSAGE should emit EVENT_MESSAGE and set message', function(){
        var mockMessage = {
            message: 'message'
        };
        store.on(store.events.EVENT_MESSAGE, eventCallback);
        dispatcherCallback({
            actionType: actions.types.ALERT.MESSAGE,
            actionArgs: mockMessage
        });

        expect(eventCallback).toBeCalled();
        expect(store.getMessage()).toEqual(mockMessage.message);
    });
});