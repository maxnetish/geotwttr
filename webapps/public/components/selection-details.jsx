var libs = require('../libs'),
    React = libs.React,
    _ = libs._;

var SelectionDetailsComponent = React.createClass({
    render: function () {
        var xMarkup = null,
            firstDetails = _.isEmpty(this.props.details) ? {} : this.props.details[0],
            firstFormattedAddress = firstDetails.formatted_address || 'Strange unknown place';

        if (this.props.details) {
            console.log(this.props.details);
            xMarkup = <section>
                <div className="selection-details-wrapper">
                    <p>{firstFormattedAddress}</p>
                </div>
            </section>;
        }

        return xMarkup;
    }
});

module.exports = {
    SelectionDetailsComponent: SelectionDetailsComponent
};