var libs = require('./../libs'),
    services = require('../services'),
    React = libs.React,
    _ = libs._,
    rootStore = require('../stores').rootStore,
    tweetFeedStore = require('../stores').tweetFeedStore;

var GoogleMapComponent = require('./google-map.jsx').MapControl;
var HeaderAccountCardComponent = require('./header-account-card.jsx').Control;
var IndicatorComponent = require('./indicator.jsx').Control;
var AppTooltipComponent = require('./app-tooltip.jsx').Control;
var SelectionDetailsComponent = require('./selection-details.jsx').SelectionDetailsComponent;
var GoogleMapGeosearchComponenet = require('./google-map-geosearch.jsx').GoogleMapGeosearch;
var TweetFeedControlComponent = require('./tweet-feed-control.jsx').TweetFeedControl;
var TweetFeedComponent = require('./tweet-feed.jsx').TweetFeedComponent;

var rootElementInstance, appConfig;

var RootElement = React.createClass({
    getInitialState: function () {
        return _.assign(appConfig, {
            mapLoaded: false,
            mapHasSelection: false,
            tweetsCount: 0,
            addingRate: 0
        });
    },
    render: function () {
        console.log('render root element');
        console.log(this.state);
        return <div>
            <header>
                <HeaderAccountCardComponent userInfo={this.state.userInfo}/>
                <h1 className="text-center">{this.state.title}</h1>
            </header>
            <div className="pane-left pane">
                <GoogleMapGeosearchComponenet />
                <GoogleMapComponent />
            </div>
            <div className="pane-right pane">
                <SelectionDetailsComponent />
                <AppTooltipComponent appTooltipText='Map loaded...' visible={!this.state.mapLoaded} />
                <AppTooltipComponent appTooltipText='Click map to see tweets near...' visible={!this.state.mapHasSelection && this.state.mapLoaded} />
                <TweetFeedControlComponent />
                <TweetFeedComponent />
            </div>
            <footer>
                <IndicatorComponent value={this.state.tweetsCount.toFixed(0)} />
                <IndicatorComponent value={this.state.addingRate.toFixed(2)} unit="tw/min" />
                <a href="https://twitter.com/maxnetish" className="twitter-follow-button" data-show-count="false" data-lang={this.state.langCode}>Follow me</a>
            </footer>
        </div>;
    },
    _onUpdateFeed: function () {
        this.setState({
            tweetsCount: tweetFeedStore.getVisibleTweets().length + tweetFeedStore.getHidedTweets().length
        });
    },
    _onUpdateAddingRate: function(){
        this.setState({
            addingRate: tweetFeedStore.getAddingRate()
        })
    },
    shouldComponentUpdate: function (nextProps, nextState) {
        return true;
    },
    componentDidMount: function () {
        tweetFeedStore.on(tweetFeedStore.events.EVENT_FEED_CHANGE, this._onUpdateFeed);
        tweetFeedStore.on(tweetFeedStore.events.EVENT_ADDING_RATE_CHANGE, this._onUpdateAddingRate);
    },
    componentWillUnmount: function () {
        tweetFeedStore.removeListener(tweetFeedStore.events.EVENT_FEED_CHANGE, this._onUpdateFeed);
        tweetFeedStore.removeListener(tweetFeedStore.events.EVENT_ADDING_RATE_CHANGE, this._onUpdateAddingRate);
    }
});

var initInBrowser = function (rootNode, config) {
    appConfig = config || {};
    rootElementInstance = React.render(<RootElement />, rootNode);
};

var renderInNode = function (config) {
    appConfig = config || {};
    return React.renderToString(<RootElement />);
};

var setState = function (partialState, callback) {
    if (rootElementInstance && _.isFunction(rootElementInstance.setState)) {
        return rootElementInstance.setState(partialState, callback);
    }
    return false;
};

var getState = function () {
    return rootElementInstance.state;
};

rootStore.once(rootStore.events.EVENT_MAP_LOADED, function () {
    var loaded = rootStore.getMapLoaded();
    setState({
        mapLoaded: loaded
    });
});

rootStore.on(rootStore.events.EVENT_MAP_SELECTION_CHANGED, function () {
    var hasSelection = rootStore.getMapHasSelection();
    setState({
        mapHasSelection: hasSelection
    });
});

//mapStore

module.exports = {
    initInBrowser: initInBrowser,
    setState: setState,
    renderInNode: renderInNode,
    getState: getState
};