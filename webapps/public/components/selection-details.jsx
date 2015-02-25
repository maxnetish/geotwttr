var libs = require('../libs'),
    React = libs.React,
    _ = libs._,
    actions = require('../actions'),
    selectionDetailsStore = require('../stores').selectionDetailsStore;

var SelectionDetailsComponent = React.createClass({
    getInitialState: function () {
        return {
            details: [],
            detailsIds: [],
            expanded: false,
            wait: false,
            radius: 0
        };
    },
    shouldComponentUpdate: function (nextProps, nextState) {
        var state = this.state;
        var should = nextState.expanded !== state.expanded || nextState.wait !== state.wait || nextState.radius !== state.radius;
        if (should) {
            return should;
        }
        return !_.isEqual(nextState.detailsIds, state.detailsIds);
    },
    render: function () {
        var self = this,
            xMarkup = null,
            firstDetails = _.isEmpty(this.state.details) ? {} : this.state.details[0],
            firstFormattedAddress = firstDetails.formatted_address,
            detailsExpandButtonClass = this.state.expanded ? 'icon icon-minus-square' : 'icon icon-plus-square',
            detailsXList = [],
            radiusFormatted = _.isNumber(this.state.radius) ? this.state.radius.toFixed(0) : this.state.radius;

        var cx = React.addons.classSet,
            ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

        var busyClasses = cx({
            'busy-wrapper': true,
            'active': this.state.wait
        });

        console.log('render SelectionDetails component');

        if (firstFormattedAddress) {
            if (this.state.expanded) {
                detailsXList = _.map(this.state.details, function (oneLevel, ind) {
                    return <div className="selection-details-line" key={oneLevel.place_id}>
                        <div className="selection-details-line-icon-wrapper">
                            <i className="icon icon-map-marker"></i>
                        </div>
                        <div className="selection-details-line-a-wrapper">
                            <a href="javascript:void 0" onClick={self.onDetailLineClick.bind(self, oneLevel)}>
                                {oneLevel.formatted_address}
                            </a>
                        </div>
                    </div>;
                });
            }

            xMarkup = <section id="selection-details">
                <div className={busyClasses}></div>
                <div className="selection-details-wrapper">
                    <div className="selection-details-title">
                        <div className="selection-details-title-button-wrapper">
                            <button onClick={this.onExpandButtonClick} className="details-expand" type="button">
                                <i className={detailsExpandButtonClass}></i>
                            </button>
                        </div>
                        <div className="selection-details-title-wrapper">
                            <b onClick={this.onExpandButtonClick}>{firstFormattedAddress}</b>
                            <span> ({radiusFormatted} m)</span>
                        </div>
                    </div>
                    <ReactCSSTransitionGroup transitionName="selection-details-transition" component="div" className="selection-details-transition-wrapper">
                        {detailsXList}
                    </ReactCSSTransitionGroup>
                </div>
            </section>;
        }

        return xMarkup;
    },
    onExpandButtonClick: function () {
        actions.selectionDetails.expandToggle();
    },
    onDetailLineClick: function (data) {
        console.log(data);
        actions.selectionDetails.detailLineClick(data);
    },
    _onUpdateStore: _.debounce(function () {
        var details = selectionDetailsStore.getDetails();
        this.setState({
            expanded: selectionDetailsStore.getDetailsExpanded(),
            wait: selectionDetailsStore.getDetailsWait(),
            details: details,
            detailsIds: _.map(details, function (r) {
                return r.place_id;
            }),
            radius: selectionDetailsStore.getSelectionRadius()
        });
    }, 500, {leading: true}),
    componentDidMount: function () {
        selectionDetailsStore.on(selectionDetailsStore.events.EVENT_EXPAND_TOGGLE, this._onUpdateStore);
        selectionDetailsStore.on(selectionDetailsStore.events.EVENT_DETAILS_WAIT_TOGGLE, this._onUpdateStore);
        selectionDetailsStore.on(selectionDetailsStore.events.EVENT_DETAILS_READY, this._onUpdateStore);
        selectionDetailsStore.on(selectionDetailsStore.events.EVENT_RADIUS_CHANGED, this._onUpdateStore);
    },
    componentWillUnmount: function () {
        selectionDetailsStore.removeListener(selectionDetailsStore.events.EVENT_EXPAND_TOGGLE, this._onUpdateStore);
        selectionDetailsStore.removeListener(selectionDetailsStore.events.EVENT_DETAILS_WAIT_TOGGLE, this._onUpdateStore);
        selectionDetailsStore.removeListener(selectionDetailsStore.events.EVENT_DETAILS_READY, this._onUpdateStore);
        selectionDetailsStore.removeListener(selectionDetailsStore.events.EVENT_RADIUS_CHANGED, this._onUpdateStore);
    }
});

module.exports = {
    SelectionDetailsComponent: SelectionDetailsComponent
};