var ko = require('../libs').ko;
var ws = require('../services/ws');

var rootViewModel = function(){
    var selectedGeosearchResult = ko.observable();
    var mapInstance = ko.observable();
    var selectionGeocode = ko.observable([]);
    var appState = require('../router').appState;
    var filterSettingsVisible = ko.observable(false);
    var toggleFilterSettings = function(){
        filterSettingsVisible(!filterSettingsVisible());
    };
    var filters = require('../services/filters');

    var tweetList = ko.observableArray();

    // tweets demo
    var reqId;
    ws.getRemote().invoke('subscribeTwitterStream', {
        notify: 'streamResp',
        reqMethod: 'GET',
        reqUrl: 'https://stream.twitter.com/1.1/statuses/filter.json',
        reqData: {
            locations: '16.542346660240696,49.1439480630349,16.679794605628445,49.23377959144685',
            stall_warnings: 'true'
        }
    }).then(function (resp) {
        console.log('subscribe id:');
        console.log(resp);
        reqId = resp;
    }, function (err) {
        console.log(err);
    });

    ws.localApi.streamResp = function (resp) {
        tweetList.unshift(resp.tweet);
        return 'Принято';
    };

    setTimeout(function () {
        ws.getRemote().invoke('unsubscribeTwitterStream', reqId)
            .then(function (res) {
                console.log('unsubscribe response: ' + res);
            });
    }, 60000);

    return {
        selectedGeosearchResult: selectedGeosearchResult,
        mapInstance: mapInstance,
        appState: appState,
        selectionGeocode: selectionGeocode,
        filterSettingsVisible: filterSettingsVisible,
        toggleFilterSettings: toggleFilterSettings,
        filters: filters,
        tweetList: tweetList
    };
};

module.exports = {
    registerComponents: function(){
        require('./map').register();
        require('./geosearch-result-item').register();
        require('./geosearch-control').register();
        require('./selection-details').register();
        require('./filter-settings-panel').register();
        require('./tweet-ui/mini').register();
    },
    registerApp: function(domRoot){
        ko.applyBindings(rootViewModel(), domRoot);
    }
};
