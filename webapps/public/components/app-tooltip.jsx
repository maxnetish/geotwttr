var libs = require('../libs'),
    React = libs.React;

var AppTooltipControl = React.createClass({
    render: function () {
        var xMarkup = null,
            visible = !!this.props.visible,
            appTooltipClass = 'app-tooltip';

        if (visible) {
            xMarkup = <section>
                <div className={appTooltipClass}>{this.props.appTooltipText}</div>
            </section>;
        }

        return xMarkup;
    }
});

module.exports = {
    Control: AppTooltipControl
};