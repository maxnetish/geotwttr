var React = require('react/addons');

var Control = React.createClass({
    getInitialState: function () {
        return {};
    },
    getDefaultProps: function(){
        return {};
    },
    render: function () {
        return <div className="fake-class">{this.props.children}</div>;
    },
    componentDidMount: function () {

    },
    componentWillUnmount: function () {

    }
});

module.exports = {
    Control: Control
};