var
    _ = require('lodash'),
    React = require('react/addons'),
    actions = require('../actions');

var tweetFeedControlStore = require('../stores').tweetFeedControlStore,
    tweetFeedStore = require('../stores').tweetFeedStore;

var TweetFeedControl = React.createClass({
    getInitialState: function () {
        return {
            hidedTweets: 0,
            visibleTweets: 0,
            showImmediate: tweetFeedControlStore.getShowTweetsImmediate()
        };
    },
    shouldComponentUpdate: function (nextProps, nextState) {
        var state = this.state;
        return nextState.hidedTweets !== state.hidedTweets || nextState.visibleTweets !== state.visibleTweets || nextState.showImmediate !== state.showImmediate;
    },
    render: function () {
        //console.log('render TweetFeedControl');
        var xResult = null,
            xShowTweetsImmediate = null,
            xShowNewTweetsButton = null,
            xResetButton = null;

        var hidedTweets = this.state.hidedTweets,
            visibleTweets = this.state.visibleTweets,
            allTweets = hidedTweets + visibleTweets;

        xShowTweetsImmediate = <label>
            <input checked={this.state.showImmediate} onChange={this.handleShowImmediateChange} type="checkbox" />
            Show tweets immediate
        </label>;

        if (hidedTweets) {
            xShowNewTweetsButton = <button type="button" onClick={this.handleShowNewTweetsButtonClick}>
                <span className="icon icon-refresh"></span>
                <span> {hidedTweets} new tweets</span>
            </button>;
        }

        if (allTweets) {
            xResetButton = <button type="button" onClick={this.handleResetButtonClick}>
                <span className="icon icon-times-circle"></span>
                <span> Clear</span>
            </button>;
        }

        xResult = <section className="tweet-feed-control-wrapper">
            <div className="tweet-feed-control">
                {xShowTweetsImmediate}
                {xShowNewTweetsButton}
                {xResetButton}
            </div>
        </section>;

        return xResult;
    },
    handleShowImmediateChange: function (event) {
        actions.tweetFeedControl.showImmediateChanged(event.target.checked);
    },
    handleShowNewTweetsButtonClick: function () {
        actions.tweetFeedControl.wantShowNewTweets();
    },
    handleResetButtonClick: function () {
        actions.tweetFeedControl.wantResetTweets();
    },
    _onUpdateShowImmediate: function () {
        var newShowImmediate = tweetFeedControlStore.getShowTweetsImmediate();
        this.setState({
            showImmediate: newShowImmediate
        });
    },
    _onUpdateFeed: function () {
        this.setState({
            visibleTweets: tweetFeedStore.getVisibleTweets().length,
            hidedTweets: tweetFeedStore.getHidedTweets().length
        });
    },
    componentDidMount: function () {
        tweetFeedControlStore.on(tweetFeedControlStore.events.EVENT_SHOW_IMMEDIATE_TOGGLE, this._onUpdateShowImmediate);
        tweetFeedStore.on(tweetFeedStore.events.EVENT_FEED_CHANGE, this._onUpdateFeed);
    },
    componentWillUnmount: function () {
        tweetFeedControlStore.removeListener(tweetFeedControlStore.events.EVENT_SHOW_IMMEDIATE_TOGGLE, this._onUpdateShowImmediate);
        tweetFeedStore.removeListener(tweetFeedStore.events.EVENT_FEED_CHANGE, this._onUpdateFeed);
    }
});

module.exports = {
    TweetFeedControl: TweetFeedControl
};