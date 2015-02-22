var libs = require('../libs'),
    React = libs.React;

var TweetComponent = React.createClass({
    render: function () {
        var tw = this.props.tweet,
            xLeftPart,
            xRightPart;

        xLeftPart = <section className="tweet-left">
            <a className="no-decoration" target="_blank" href={'https://twitter.com/' + tw.user.screen_name}>
                <img className="avatar" src={tw.user.profile_image_url}/>
            </a>
        </section>;

        xRightPart = <section className="tweet-right">
            {tw.text}
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