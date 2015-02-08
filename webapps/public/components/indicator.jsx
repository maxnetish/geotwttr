var libs = require('../libs'),
    React = libs.React;

var Control = React.createClass({
    render: function () {
        return <section className="inner-info">
            <span>{this.props.value || 0}</span>
            {this.props.unit ? <span>&nbsp;{this.props.unit}</span> : null}
        </section>;
    }
});

module.exports = {
    Control: Control
};