var libs = require('../libs'),
    React = libs.React,
    _ = libs._;

var Control = React.createClass({
    shouldComponentUpdate: function(nextProps, nextState){
        return !_.isEqual(nextProps, this.props);
    },
    render: function () {
        console.log('render IndicatorControl');
        return <section className="inner-info">
            <span>{this.props.value || 0}</span>
            {this.props.unit ? <span>&nbsp;{this.props.unit}</span> : null}
        </section>;
    }
});

module.exports = {
    Control: Control
};