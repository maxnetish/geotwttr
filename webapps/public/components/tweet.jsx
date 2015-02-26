var
    React = require('react/addons'),
    _ = require('lodash'),
    actions = require('../actions');

var renderTweetTextEntity = {
    'simple': function (originalTweetText, entity, id) {
        return <span className="plain" key={id}>
            {originalTweetText.substring(entity.indices[0], entity.indices[1] + 1)}
        </span>;
    },
    'urls': function (originalTweetText, entity, id) {
        return <a className="entity url" target="_blank" href={entity.expanded_url} key={id}>
            {entity.display_url}
        </a>;
    },
    'user_mentions': function (originalTweetText, entity, id) {
        return <a className="entity user-mention" target="_blank" href={'https://twitter.com/' + entity.screen_name} key={id}>
            {entity.screen_name}
        </a>;
    },
    'hashtags': function (originalTweetText, entity, id) {
        return <span className="entity hashtag" key={id}>
            {entity.text}
        </span>;
    },
    'photo': function (originalTweetText, entity, id) {
        return <a className="entity url photo" target="_blank" href={entity.expanded_url} key={id}>
            {entity.display_url}
        </a>;
    },
    'media': function (originalTweetText, entity, id) {
        return <a className="entity url" target="_blank" href={entity.expanded_url} key={id}>
            {entity.display_url}
        </a>;
    },
    'symbols': function (originalTweetText, entity, id) {
        return <span className="entity symbol" key={id}>
            {entity.text}
        </span>;
    },
    'default': function (originalTweetText, entity, id) {
        console.log(entity);
        return <span className="entity" key={id}>
            {originalTweetText.substring(entity.indices[0], entity.indices[1] + 1)}
        </span>;
    }
};

var TweetComponent = React.createClass({
    shouldComponentUpdate: function (nextProps, nextState) {
        var nextId = nextProps.tweet && nextProps.tweet.id_str,
            id = this.props.tweet && this.props.tweet.id_str;
        return nextId !== id;
    },
    render: function () {
        console.log('render TweetComponent');
        var tw = this.props.tweet,
            xLeftPart,
            xRightPart,
            xTextPart = null;

        var cx = React.addons.classSet,
            ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

        var tweetTextClass = cx({
            'text-rtl': tw.useRtl,
            'tweet-text': true
        });

        if (tw.textOriginal && tw.textOriginal.length) {
            xTextPart = _.map(tw.entitiesOriginal, function (oneEntity, idx) {
                var actualEntityType = renderTweetTextEntity.hasOwnProperty(oneEntity.type) ? oneEntity.type : 'default';
                return renderTweetTextEntity[actualEntityType](tw.textOriginal, oneEntity, idx);
            });
        }

        xLeftPart = <section className="tweet-left">
            <a className="no-decoration" target="_blank" href={tw.profileOriginalUrl}>
                <img className="avatar" src={tw.avatarUrl}/>
            </a>
        </section>;

        xRightPart = <section className="tweet-right">
            <p className="tweet-usernames">
                <a className="no-decoration" href={tw.profileOriginalUrl} target="_blank">
                    <span className="full-name">{tw.userOriginalName}</span>
                    <span className="screen-name">{tw.userOriginalScreenName}</span>
                </a>
            </p>
            <p className={tweetTextClass}>{xTextPart}</p>
            <p className="tweet-meta">
                <a className="no-decoration" href={tw.tweetUrl} target="_blank">
                    <time className="tweet-date">{tw.createdAtOriginal}</time>
                </a>
                {tw.isRetweet ? <span className="retweet-from">
                    RT from
                    <a className="no-decoration" href={tw.profileSenderUrl} target="_blank">
                        <span className="screen-name">{tw.senderScreenName}</span>
                    </a>
                </span> : null}
            </p>
            {tw.place ? <p className="tweet-meta">
                <a className="no-decoration" href="javascript:void 0" onClick={this.handlePlaceClick}>Near {tw.place.full_name}</a>
            </p> : null}
            {tw.coordinates ? <p className="tweet-meta">
                <a className="no-decoration" href="javascript:void 0" onClick={this.handleCoordsClick}>
                    <span className="icon icon-map-marker"></span>
                    <span> {tw.coordinatesH}</span>
                </a>
            </p> : null}
        </section>;

        return <article>
            {xLeftPart}
            {xRightPart}
        </article>;
    },
    handlePlaceClick: function () {
        actions.tweet.placeClick(this.props.tweet.place);
    },
    handleCoordsClick: function () {
        actions.tweet.coordsClick(this.props.tweet.coordinates && this.props.tweet.coordinates.coordinates);
    }
});

module.exports = {
    TweetComponent: TweetComponent
};