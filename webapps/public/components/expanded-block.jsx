var React = require('react/addons');

var Control = React.createClass({
    getInitialState: function () {
        return {};
    },
    getDefaultProps: function () {
        return {
            expanded: false,
            classBase: '',
            classExpanded: '',
            classCollapsed: ''
        };
    },
    shouldComponentUpdate: function (nextProps, nextState) {
        return true;
    },
    render: function () {


        return <div className="">{this.props.children}</div>;
    },
    componentDidMount: function () {

    },
    componentWillUnmount: function () {

    }
});

module.exports = {
    Control: Control
};