var libs = require('../libs'),
    React = libs.React;


var Control = React.createClass({
    getInitialState: function () {
        return {
            userInfo: {
                screen_name: 'Example'
            }
        };
    },
    render: function () {
        var twitterHref = 'https://twitter.com/' + this.props.userInfo.screen_name,
            twitterScreenName = this.props.userInfo.screen_name;

        return <div className="account-card text-center">
            Signed in as
            <a className="no-decoration" href={twitterHref} target="_blank">
                <span className="screen-name">{twitterScreenName}</span>
            </a>
            <a className="logout" href="/logout">Sign-out</a>
        </div>;
    }
});

module.exports = {
    Control: Control
};