var libs = require('../libs'),
    _ = libs._,
    React = libs.React,
    actions = require('../actions');

var tweetFeedControlStore = require('../stores').tweetFeedControlStore;

var TweetFeedControl = React.createClass({
    getInitialState: function () {
        return {
            hidedTweets: 0,
            visibleTweets: 0,
            showImmediate: true
        };
    },
    render: function () {
        var xResult = null,
            xShowTweetsImmediate = null,
            xShowNewTweetsButton = null,
            xResetButton = null;

        var hidedTweets = this.state.hidedTweets,
            visibleTweets = this.state.visibleTweets,
            allTweets = hidedTweets + visibleTweets;

        xShowTweetsImmediate = <label>
            <input value={this.state.showImmediate} onChange={this.handleShowImmediateChange} type="checkbox" />
            Show tweets immediate
        </label>;

        if (hidedTweets) {
            xShowNewTweetsButton = <button type="button" onClick={this.handleShowNewTweetsButtonClick}>
                <span className="icon icon-refresh"></span>
                <span> {hidedTweets} new tweets</span>
            </button>;
        }

        if (visibleTweets) {
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
        console.log(event.target);
        actions.tweetFeedControl.showImmediateChanged(event.target.checked);
    },
    handleShowNewTweetsButtonClick: function(){
        actions.tweetFeedControl.wantShowNewTweets();
    },
    handleResetButtonClick: function(){
        actions.tweetFeedControl.wantResetTweets();
    },
    _onUpdateShowImmediate: function () {
        var newShowImmediate = tweetFeedControlStore.getShowTweetsImmediate();
        this.setState({
            showImmediate: newShowImmediate
        });
    },
    componentDidMount: function () {
        tweetFeedControlStore.on(tweetFeedControlStore.events.EVENT_SHOW_IMMEDIATE_TOGGLE, this._onUpdateShowImmediate);
    },
    componentWillUnmount: function () {
        tweetFeedControlStore.removeListener(tweetFeedControlStore.events.EVENT_SHOW_IMMEDIATE_TOGGLE, this._onUpdateShowImmediate);
    }
});

module.exports = {
    TweetFeedControl: TweetFeedControl
};