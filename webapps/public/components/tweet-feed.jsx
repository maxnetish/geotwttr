var libs = require('../libs'),
    _ = libs._,
    React = libs.React,
    actions = require('../actions');

var tweetFeedStore = require('../stores').tweetFeedStore;

var TweetFeedComponent = React.createClass({
    getInitialState: function () {
        return {
            visibleTweets: [],
            hidedTweets: []
        };
    },
    render: function () {
        var xUl = null,
            xLiList = null;

        if (this.state.visibleTweets.length) {
            xLiList = _.map(this.state.visibleTweets, function (tw) {
                return <li>{tw.text}</li>
            });

            xUl = <ul className="scroll">
                {xLiList}
            </ul>
        }

        return <section>
            Visible: {this.state.visibleTweets.length}
            {xUl}
        </section>;
    },
    componentDidMount: function () {
        tweetFeedStore.on(tweetFeedStore.events.EVENT_FEED_CHANGE, this._onUpdateFeed);
    },
    componentWillUnmount: function () {
        tweetFeedStore.removeListener(tweetFeedStore.events.EVENT_FEED_CHANGE, this._onUpdateFeed);
    },
    _onUpdateFeed: function () {
        this.setState({
            visibleTweets: tweetFeedStore.getVisibleTweets(),
            hidedTweets: tweetFeedStore.getHidedTweets()
        });
    }
});

module.exports = {
    TweetFeedComponent: TweetFeedComponent
};