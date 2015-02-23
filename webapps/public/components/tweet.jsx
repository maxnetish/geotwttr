var libs = require('../libs'),
    React = libs.React,
    _ = libs._;

var renderTweetTextEntity = {
    'simple': function (originalTweetText, entity) {
        return <span className="plain">
            {originalTweetText.substring(entity.indices[0], entity.indices[1] + 1)}
        </span>;
    },
    'urls': function (originalTweetText, entity) {
        return <a className="entity url" target="_blank" href={entity.expanded_url}>
            {entity.display_url}
        </a>;
    },
    'user_mentions': function (originalTweetText, entity) {
        return <a className="entity user-mention" target="_blank" href={'https://twitter.com/' + entity.screen_name}>
            {entity.screen_name}
        </a>;
    },
    'hashtags': function (originalTweetText, entity) {
        return <span className="entity hashtag">
            {entity.text}
        </span>;
    },
    'photo': function (originalTweetText, entity) {
        return <a className="entity url photo" target="_blank" href={entity.expanded_url}>
            {entity.display_url}
        </a>;
    },
    'media': function (originalTweetText, entity) {
        return <a className="entity url" target="_blank" href={entity.expanded_url}>
            {entity.display_url}
        </a>;
    },
    'symbols': function (originalTweetText, entity) {
        return <span className="entity symbol">
            {entity.text}
        </span>;
    },
    'default': function (originalTweetText, entity) {
        console.log(entity);
        return <span className="entity">
            {originalTweetText.substring(entity.indices[0], entity.indices[1] + 1)}
        </span>;
    }
};

var TweetComponent = React.createClass({
    render: function () {
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
            xTextPart = _.map(tw.entitiesOriginal, function (oneEntity) {
                var actualEntityType = renderTweetTextEntity.hasOwnProperty(oneEntity.type) ? oneEntity.type : 'default';
                return renderTweetTextEntity[actualEntityType](tw.textOriginal, oneEntity);
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
                <a className="no-decoration" href="javascript:void 0">Near {tw.place.full_name}</a>
            </p> : null}
            {tw.coordinates ? <p className="tweet-meta">
                <a className="no-decoration" href="javascript:void 0">
                    <span className="icon icon-map-marker"></span>
                    <span> {tw.coordinatesH}</span>
                </a>
            </p> : null}
        </section>;

        return <article>
            {xLeftPart}
            {xRightPart}
        </article>;
    }
});

module.exports = {
    TweetComponent: TweetComponent
};