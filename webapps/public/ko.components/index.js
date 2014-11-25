var libs = require('../libs');
var ko = libs.ko;
var services = require('../services');
var ws = services.ws;
var utils = services.utils;
var TweetList = services.tweetList;

var rootViewModel = function () {
    var selectedGeosearchResult = ko.observable();
    var mapInstance = ko.observable();
    var selectionGeocode = ko.observable([]);
    var appState = require('../router').appState;
    var filterSettingsVisible = ko.observable(false);
    var toggleFilterSettings = function () {
        filterSettingsVisible(!filterSettingsVisible());
    };
    var filters = require('../services/filters');

    var mapNotYetLoaded = ko.computed({
        read: function () {
            return !mapInstance();
        },
        pure: true,
        deferEvaluation: true
    });

    var showAppTooltip = ko.computed({
        read: function () {
            var result = !!mapInstance() && !appState.selection().lat;
            return result;
        },
        pure: true,
        deferEvaluation: true
    });

    var showImmediate = ko.observable(true);
    var showHidedTweets = ko.observable();

    var tweetList = new TweetList(showImmediate, showHidedTweets);

    // tweets demo
    var gmaps = null;
    libs.promiseGmaps().then(function (gmapsNamespace) {
        gmaps = gmapsNamespace;
    });
    var reqId;

    appState.selection.subscribe(function (newSelection) {

        if (!newSelection) {
            return;
        }

        var twitterBounds = utils.boundsToTwitterString(utils.centerRadiusToBounds(newSelection.lat, newSelection.lng, newSelection.radius, gmaps));

        if (reqId) {
            ws.getRemote().invoke('unsubscribeTwitterStream', reqId)
                .then(function (res) {
                    console.log('unsubscribe response: ' + res);
                });
        }

        // вычислить bounds из newSelection
        ws.getRemote().invoke('subscribeTwitterStream', {
            notify: 'streamResp',
            reqMethod: 'GET',
            reqUrl: 'https://stream.twitter.com/1.1/statuses/filter.json',
            reqData: {
                locations: twitterBounds,
                stall_warnings: 'true'
            }
        }).then(function (resp) {
            console.log('subscribe id:');
            console.log(resp);
            reqId = resp;
            tweetList.reset();
        }, function (err) {
            console.log(err);
        });
    });

    /*
     ws.getRemote().invoke('subscribeTwitterStream', {
     notify: 'streamResp',
     reqMethod: 'GET',
     reqUrl: 'https://stream.twitter.com/1.1/statuses/filter.json',
     reqData: {
     locations: '0.38219015604818196,49.1021507144911,4.623455595904943,51.80228882919188',
     stall_warnings: 'true'
     }
     }).then(function (resp) {
     console.log('subscribe id:');
     console.log(resp);
     reqId = resp;
     }, function (err) {
     console.log(err);
     });
     */

    ws.localApi.streamResp = function (resp) {
        if (resp.tweet && resp.tweet.id) {
            // tweet really
            tweetList.addItem(resp.tweet);
        }
        return 'OK';
    };

    /*
     setTimeout(function () {
     ws.getRemote().invoke('unsubscribeTwitterStream', reqId)
     .then(function (res) {
     console.log('unsubscribe response: ' + res);
     });
     }, 60000);
     */

    return {
        selectedGeosearchResult: selectedGeosearchResult,
        mapInstance: mapInstance,
        appState: appState,
        selectionGeocode: selectionGeocode,
        filterSettingsVisible: filterSettingsVisible,
        toggleFilterSettings: toggleFilterSettings,
        filters: filters,
        tweetList: tweetList,
        showImmediate: showImmediate,
        showHidedTweets: showHidedTweets,
        mapNotYetLoaded: mapNotYetLoaded,
        showAppTooltip: showAppTooltip
    };
};

module.exports = {
    registerComponents: function () {
        require('./map').register();
        require('./geosearch-result-item').register();
        require('./geosearch-control').register();
        require('./selection-details').register();
        require('./filter-settings-panel').register();
        require('./tweet-ui/mini').register();
        require('./tweet-feed-control').register();
    },
    registerApp: function (domRoot) {
        ko.applyBindings(rootViewModel(), domRoot);
    }
};
