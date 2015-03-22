jest.dontMock('lodash');
jest.dontMock('../tweet-feed-control-store');

describe('tweet-feed-control-store', function () {
    var _, dispatcher, actions, store, dispatcherCallback, eventCallback;

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