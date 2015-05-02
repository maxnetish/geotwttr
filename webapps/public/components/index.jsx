var
    services = require('../services'),
    React = require('react/addons'),
    _ = require('lodash'),
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
        //console.log('render RootElement');
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
    _onUpdateAddingRate: function () {
        this.setState({
            addingRate: tweetFeedStore.getAddingRate()
        })
    },
    _onMapLoaded: function () {
        var loaded = rootStore.getMapLoaded();
        this.setState({
            mapLoaded: loaded
        });
    },
    _onMapSelectionChanged: function () {
        var hasSelection = rootStore.getMapHasSelection();
        this.setState({
            mapHasSelection: hasSelection
        });
    },
    shouldComponentUpdate: function (nextProps, nextState) {
        return !_.isEqual(nextState, this.state);
    },
    componentDidMount: function () {
        rootStore.once(rootStore.events.EVENT_MAP_LOADED, this._onMapLoaded);
        rootStore.on(rootStore.events.EVENT_MAP_SELECTION_CHANGED, this._onMapSelectionChanged);
        tweetFeedStore.on(tweetFeedStore.events.EVENT_FEED_CHANGE, this._onUpdateFeed);
        tweetFeedStore.on(tweetFeedStore.events.EVENT_ADDING_RATE_CHANGE, this._onUpdateAddingRate);
    },
    componentWillUnmount: function () {
        rootStore.removeListener(rootStore.events.EVENT_MAP_SELECTION_CHANGED, this._onMapSelectionChanged);
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

//mapStore

module.exports = {
    initInBrowser: initInBrowser,
    renderInNode: renderInNode
};