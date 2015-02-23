var libs = require('../libs'),
    _ = libs._,
    React = libs.React,
    actions = require('../actions');

var tweetFeedStore = require('../stores').tweetFeedStore;

var TweetComponent = require('./tweet.jsx').TweetComponent;

var TweetFeedComponent = React.createClass({
    getInitialState: function () {
        return {
            visibleTweets: [],
            visibleCount: 0
        };
    },
    render: function () {
        var xUl = null,
            xLiList = null;

        var cx = React.addons.classSet,
            ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

        if (this.state.visibleTweets.length) {
            xLiList = _.map(this.state.visibleTweets, function (tw) {
                return <li key={tw.id_str} className="li-tweet">
                    <TweetComponent tweet={tw}/>
                </li>
            });

            xUl = <ReactCSSTransitionGroup transitionName="tweet-transition" component="ul" className="scroll">
                {xLiList}
            </ReactCSSTransitionGroup>
        }

        return <section>
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
        var visible = tweetFeedStore.getVisibleTweets();
        this.setState({
            visibleTweets: visible,
            visibleCount: visible.length
        });
    },
    shouldComponentUpdate: function (nextProps, nextState) {
        return nextState.visibleCount !== this.state.visibleCount;
    }
});

module.exports = {
    TweetFeedComponent: TweetFeedComponent
};