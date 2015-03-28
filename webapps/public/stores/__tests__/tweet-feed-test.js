jest.dontMock('lodash');
jest.dontMock('../tweet-feed-store');

describe('tweet-feed-store', function () {
    var _, dispatcher, actions, store, dispatcherCallback, eventCallback, tweetFeedControlStore, tweetViewModelService, mapStore, mockSelection, tweetProviderService;

    beforeEach(function () {
        _ = require('lodash');

        jest.useRealTimers();

        // mock debounce calls
        spyOn(_, 'debounce').andCallFake(function (func) {
            return function () {
                func.apply(this, arguments);
            };
        });
        spyOn(_, 'defer').andCallFake(function (func, args) {
            if (func) {
                var argsToApply = Array.prototype.slice.call(arguments, 1);
                return func.apply(this, argsToApply);
            }
        });
        spyOn(_, 'throttle').andCallFake(function (func) {
            return function () {
                func.apply(this, arguments);
            };
        });

        tweetViewModelService = require('../../services').tweetViewModel;
        tweetViewModelService.create.mockImplementation(function (tw) {
            return _.create(tw, {
                mockViewModel: true,
                id: _.uniqueId()
            });
        });

        // mock mapStore
        mockSelection = {
            center: {
                lat: 1.234,
                lng: 5.678
            },
            radius: 1000
        };
        mapStore = require('../map-store');
        mapStore.getSelection.mockReturnValue(mockSelection);

        // instantiate tweetProvider
        tweetProviderService = require('../../services').wsTweetProvider;

        tweetFeedControlStore = require('../tweet-feed-control-store');

        dispatcher = require('../../dispatcher');
        actions = require('../../actions');
        store = require('../tweet-feed-store');

        // mock dispatcher callback
        dispatcherCallback = dispatcher.register.mock.calls[0][0];
        eventCallback = jest.genMockFunction();
    });

    afterEach(function () {
        store.removeAllListeners();
    });

    it('After TWEET_PROVIDER.RECEIVE_TWEET should emit EVENT_FEED_CHANGE', function () {
        var mockTweet = {
            foo: 'bar'
        };

        // mock control store
        tweetFeedControlStore.getShowTweetsImmediate.mockReturnValue(true);

        store.on(store.events.EVENT_FEED_CHANGE, eventCallback);
        dispatcherCallback({
            actionType: actions.types.TWEET_PROVIDER.RECEIVE_TWEET,
            actionArgs: {tweet: mockTweet}
        });

        expect(eventCallback).toBeCalled();
    });

    it('After TWEET_PROVIDER.RECEIVE_TWEET and getShowTweetsImmediate:true should add tweet to getVisibleTweets()', function () {
        var mockTweet = {
            id: _.uniqueId(),
            foo: 'bar'
        };
        var inititalHidedLen = store.getHidedTweets().length;
        var initialVisibleLen = store.getVisibleTweets().length;

        // mock control store
        tweetFeedControlStore.getShowTweetsImmediate.mockReturnValue(true);

        store.on(store.events.EVENT_FEED_CHANGE, eventCallback);
        dispatcherCallback({
            actionType: actions.types.TWEET_PROVIDER.RECEIVE_TWEET,
            actionArgs: {tweet: mockTweet}
        });

        expect(store.getVisibleTweets().length).toBe(initialVisibleLen + 1);
        expect(store.getVisibleTweets().shift().mockViewModel).toBeTruthy();
        expect(store.getHidedTweets().length).toBe(inititalHidedLen);
    });

    it('After TWEET_PROVIDER.RECEIVE_TWEET and getShowTweetsImmediate:false should add tweet to getHidedTweets()', function () {
        var mockTweet = {
            id: _.uniqueId(),
            foo: 'bar'
        };
        var initialVisibleLen = store.getVisibleTweets().length;
        var inititalHidedLen = store.getHidedTweets().length;

        // mock control store
        tweetFeedControlStore.getShowTweetsImmediate.mockReturnValue(false);

        store.on(store.events.EVENT_FEED_CHANGE, eventCallback);
        dispatcherCallback({
            actionType: actions.types.TWEET_PROVIDER.RECEIVE_TWEET,
            actionArgs: {tweet: mockTweet}
        });

        expect(store.getHidedTweets().length).toBe(inititalHidedLen + 1);
        expect(store.getHidedTweets().shift().mockViewModel).toBeTruthy();
        expect(store.getVisibleTweets().length).toBe(initialVisibleLen);
    });

    it('After TWEET_PROVIDER.RECEIVE_TWEET should emit EVENT_ADDING_RATE_CHANGE', function () {
        var mockTweet = {
            id: _.uniqueId(),
            foo: 'bar'
        };

        // mock control store
        tweetFeedControlStore.getShowTweetsImmediate.mockReturnValue(false);

        store.on(store.events.EVENT_ADDING_RATE_CHANGE, eventCallback);
        dispatcherCallback({
            actionType: actions.types.TWEET_PROVIDER.RECEIVE_TWEET,
            actionArgs: {tweet: mockTweet}
        });

        expect(eventCallback).toBeCalled();
    });

    it('After TWEET_PROVIDER.RECEIVE_TWEET check for adding rate', function () {
        var mockTweet = {
            id: _.uniqueId(),
            foo: 'bar'
        };

        // use normal timers here
        jest.useRealTimers();

        // mock control store
        tweetFeedControlStore.getShowTweetsImmediate.mockReturnValue(false);
        store.on(store.events.EVENT_ADDING_RATE_CHANGE, eventCallback);

        runs(function () {
            setTimeout(function () {
                dispatcherCallback({
                    actionType: actions.types.TWEET_PROVIDER.RECEIVE_TWEET,
                    actionArgs: {tweet: mockTweet}
                });
            }, 1000);
        });

        waitsFor(function () {
            return eventCallback.mock.calls.length;
        }, 'eventCallback not called', 1500);

        runs(function () {
            // should be ~60 (tweets per min)
            expect(store.getAddingRate()).toBeGreaterThan(58);
            expect(store.getAddingRate()).toBeLessThan(62);
        });
    });

    it('After MAP.SELECTION_CENTER_CHANGED should call tweetProvider.subscribe', function () {
        var mockProvider;

        dispatcherCallback({
            actionType: actions.types.MAP.SELECTION_CENTER_CHANGED,
            actionArgs: {foo: 'bar'}
        });
        mockProvider = tweetProviderService.Provider.mock.instances[0];

        expect(mockProvider.subscribe).toBeCalled();
        expect(mockProvider.subscribe.mock.calls[0][0].geoSelection).toEqual(mockSelection);
    });

    it('After MAP.SELECTION_CENTER_CHANGED should emit EVENT_FEED_CHANGE and reset visible and hided and startTime', function () {
        var myTime;

        // fill store
        tweetFeedControlStore.getShowTweetsImmediate.mockReturnValue(true);
        _.each([1, 2, 3], function () {
            dispatcherCallback({
                actionType: actions.types.TWEET_PROVIDER.RECEIVE_TWEET,
                actionArgs: {
                    tweet: {
                        id: _.uniqueId()
                    }
                }
            });
        });
        tweetFeedControlStore.getShowTweetsImmediate.mockReturnValue(false);
        _.each([1, 2], function () {
            dispatcherCallback({
                actionType: actions.types.TWEET_PROVIDER.RECEIVE_TWEET,
                actionArgs: {
                    tweet: {
                        id: _.uniqueId()
                    }
                }
            });
        });

        store.on(store.events.EVENT_FEED_CHANGE, eventCallback);
        myTime = Date.now();
        dispatcherCallback({
            actionType: actions.types.MAP.SELECTION_CENTER_CHANGED,
            actionArgs: {foo: 'bar'}
        });

        expect(eventCallback).toBeCalled();
        expect(store.getVisibleTweets().length).toBe(0);
        expect(store.getHidedTweets().length).toBe(0);
        expect(store.getStartTime()).toBeGreaterThan(myTime - 1);
    });

    it('After MAP.SELECTION_RADIUS_CHANGED should call tweetProvider.subscribe', function () {
        var mockProvider;

        dispatcherCallback({
            actionType: actions.types.MAP.SELECTION_RADIUS_CHANGED,
            actionArgs: {foo: 'bar'}
        });
        mockProvider = tweetProviderService.Provider.mock.instances[0];

        expect(mockProvider.subscribe).toBeCalled();
        expect(mockProvider.subscribe.mock.calls[0][0].geoSelection).toEqual(mockSelection);
    });

    it('After MAP.SELECTION_RADIUS_CHANGED should emit EVENT_FEED_CHANGE and reset visible and hided and startTime', function () {
        var myTime;

        // fill store
        tweetFeedControlStore.getShowTweetsImmediate.mockReturnValue(true);
        _.each([1, 2, 3], function () {
            dispatcherCallback({
                actionType: actions.types.TWEET_PROVIDER.RECEIVE_TWEET,
                actionArgs: {
                    tweet: {
                        id: _.uniqueId()
                    }
                }
            });
        });
        tweetFeedControlStore.getShowTweetsImmediate.mockReturnValue(false);
        _.each([1, 2], function () {
            dispatcherCallback({
                actionType: actions.types.TWEET_PROVIDER.RECEIVE_TWEET,
                actionArgs: {
                    tweet: {
                        id: _.uniqueId()
                    }
                }
            });
        });

        store.on(store.events.EVENT_FEED_CHANGE, eventCallback);
        myTime = Date.now();
        dispatcherCallback({
            actionType: actions.types.MAP.SELECTION_RADIUS_CHANGED,
            actionArgs: {foo: 'bar'}
        });

        expect(eventCallback).toBeCalled();
        expect(store.getVisibleTweets().length).toBe(0);
        expect(store.getHidedTweets().length).toBe(0);
        expect(store.getStartTime()).toBeCloseTo(myTime, 1);
    });

    it('After TWEET_FEED_CONTROL.WANT_SHOW_NEW_TWEETS should emit EVENT_FEED_CHANGE', function () {
        store.on(store.events.EVENT_FEED_CHANGE, eventCallback);
        dispatcherCallback({
            actionType: actions.types.TWEET_FEED_CONTROL.WANT_SHOW_NEW_TWEETS,
            actionArgs: null
        });

        expect(eventCallback).toBeCalled();
    });

    it('After  TWEET_FEED_CONTROL.WANT_SHOW_NEW_TWEETS: all hided tweets become visible', function () {
        var lastAdded;
        // fill store with 3 visible and 2 hided tweets
        tweetFeedControlStore.getShowTweetsImmediate.mockReturnValue(true);
        _.each([1, 2, 3], function () {
            dispatcherCallback({
                actionType: actions.types.TWEET_PROVIDER.RECEIVE_TWEET,
                actionArgs: {
                    tweet: {
                        id: _.uniqueId()
                    }
                }
            });
        });
        tweetFeedControlStore.getShowTweetsImmediate.mockReturnValue(false);
        _.each([1, 2], function () {
            dispatcherCallback({
                actionType: actions.types.TWEET_PROVIDER.RECEIVE_TWEET,
                actionArgs: {
                    tweet: {
                        id: _.uniqueId()
                    }
                }
            });
        });

        lastAdded = store.getHidedTweets()[0];
        dispatcherCallback({
            actionType: actions.types.TWEET_FEED_CONTROL.WANT_SHOW_NEW_TWEETS,
            actionArgs: null
        });

        expect(store.getHidedTweets().length).toBe(0);
        expect(store.getVisibleTweets().length).toBe(5);
        expect(store.getVisibleTweets()[0].id).toBe(lastAdded.id);
    });

    it('After TWEET_FEED_CONTROL.WANT_RESET_TWEETS should emit EVENT_FEED_CHANGE', function () {
        store.on(store.events.EVENT_FEED_CHANGE, eventCallback);
        dispatcherCallback({
            actionType: actions.types.TWEET_FEED_CONTROL.WANT_RESET_TWEETS,
            actionArgs: null
        });
        expect(eventCallback).toBeCalled();
    });

    it('After TWEET_FEED_CONTROL.WANT_RESET_TWEETS should reset visible, hided and startTime', function () {
        var myTime;

        // fill store with 3 visible and 2 hided tweets
        tweetFeedControlStore.getShowTweetsImmediate.mockReturnValue(true);
        _.each([1, 2, 3], function () {
            dispatcherCallback({
                actionType: actions.types.TWEET_PROVIDER.RECEIVE_TWEET,
                actionArgs: {
                    tweet: {
                        id: _.uniqueId()
                    }
                }
            });
        });
        tweetFeedControlStore.getShowTweetsImmediate.mockReturnValue(false);
        _.each([1, 2], function () {
            dispatcherCallback({
                actionType: actions.types.TWEET_PROVIDER.RECEIVE_TWEET,
                actionArgs: {
                    tweet: {
                        id: _.uniqueId()
                    }
                }
            });
        });

        myTime = Date.now();
        dispatcherCallback({
            actionType: actions.types.TWEET_FEED_CONTROL.WANT_RESET_TWEETS,
            actionArgs: null
        });

        expect(store.getVisibleTweets().length).toBe(0);
        expect(store.getHidedTweets().length).toBe(0);
        expect(store.getStartTime()).toBeCloseTo(myTime, 1);
    });
});