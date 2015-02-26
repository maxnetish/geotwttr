var
    React = require('react/addons');


var Control = React.createClass({
    shouldComponentUpdate: function (nextProps, nextState) {
        return false;
    },
    render: function () {
        console.log('render HeaderControl');
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