var libs = require('../libs'),
    React = libs.React;

var AppTooltipControl = React.createClass({
    render: function () {
        console.log('render AppTooltipControl');
        var xMarkup = null,
            visible = !!this.props.visible,
            appTooltipClass = 'app-tooltip';

        if (visible) {
            xMarkup = <section>
                <div className={appTooltipClass}>{this.props.appTooltipText}</div>
            </section>;
        }

        return xMarkup;
    },
    shouldComponentUpdate: function (nextProps, nextState) {
        return nextProps.visible !== this.props.visible;
    }
});

module.exports = {
    Control: AppTooltipControl
};