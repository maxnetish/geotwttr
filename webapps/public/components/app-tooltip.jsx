var libs = require('../libs'),
    React = libs.React;

var AppTooltipControl = React.createClass({
    render: function () {
        var xMarkup = null,
            visible = !this.props.mapLoaded,
            mapTooltipClass = 'app-tooltip',
            appTooltipClass = 'app-tooltip';

        if (this.props.mapLoaded) {
            mapTooltipClass = mapTooltipClass + ' hided';
        }

        if (visible) {
            xMarkup = <section>
                <div className={mapTooltipClass}>Loading map...</div>
            </section>;
        }

        return xMarkup;
    }
});

module.exports = {
    Control: AppTooltipControl
};