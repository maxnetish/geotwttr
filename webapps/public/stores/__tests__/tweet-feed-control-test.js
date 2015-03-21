jest.dontMock('lodash');
jest.dontMock('../tweet-feed-control-store');

describe('selection-details-store', function () {
    var _, dispatcher, actions, store, dispatcherCallback, eventCallback;

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

        dispatcher = require('../../dispatcher');
        actions = require('../../actions');
        store = require('../tweet-feed-control-store');

        // mock dispatcher callback
        dispatcherCallback = dispatcher.register.mock.calls[0][0];
        eventCallback = jest.genMockFunction();
    });

    afterEach(function () {
        store.removeAllListeners();
    });

    it('After TWEET_FEED_CONTROL.SHOW_IMMEDIATE_CHANGED should emit EVENT_SHOW_IMMEDIATE_TOGGLE and toggle getShowTweetsImmediate()', function () {

        store.on(store.events.EVENT_SHOW_IMMEDIATE_TOGGLE, eventCallback);
        dispatcherCallback({
            actionType: actions.types.TWEET_FEED_CONTROL.SHOW_IMMEDIATE_CHANGED,
            actionArgs: {showTweetsImmediate: false}
        });

        expect(eventCallback).toBeCalled();
        expect(store.getShowTweetsImmediate()).toBeFalsy();

        eventCallback.mockClear();
        dispatcherCallback({
            actionType: actions.types.TWEET_FEED_CONTROL.SHOW_IMMEDIATE_CHANGED,
            actionArgs: {showTweetsImmediate: true}
        });

        expect(eventCallback).toBeCalled();
        expect(store.getShowTweetsImmediate()).toBeTruthy();
    });
});