var
    _ = require('lodash'),
    React = require('react/addons'),
    actions = require('../actions'),
    DISPLAY_NAME = 'Toaster',
    severity = {
        WARNING: 'warning',
        MESSAGE: 'message'
    },
    ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;;

var Control = React.createClass({
    displayName: DISPLAY_NAME,
    getDefaultProps: function () {
        return {
            items: [],
            removeToast: _.noop()
        };
    },
    shouldComponentUpdate: function (nextProps, nextState) {
        return true;
    },
    render: function () {
        // TODO implement modal functionality

        var xMarkup = null;
        var xList;
        var self = this;

        //if (!(this.props.items && this.props.items.length)) {
        //    return xMarkup;
        //}

        xList = _.map(this.props.items, function (oneItem) {
            var iconClass = oneItem.severity === severity.WARNING ? 'icon icon-warning' : 'icon icon-info-circle';
            return <li className={'toaster-item '+oneItem.severity} key={oneItem.id}>
                <div className="toast-icon-wrapper">
                    <i className={iconClass}></i>
                </div>
                <div className="toast-body-wrapper">
                    <h4>{oneItem.title}</h4>
                    {oneItem.severity === severity.WARNING ? <pre className="scroll">{oneItem.text}</pre> :
                        <p>{oneItem.text}</p>}
                </div>
                <div className="toast-close-button-wrapper">
                    <button type="button" title="Hide" onClick={self.handleCloseToast.bind(self, oneItem)}>
                        <i className="icon icon-times-circle-o"></i>
                    </button>
                </div>
            </li>
        });

        xMarkup = <div className="toaster-wrapper">
            <ReactCSSTransitionGroup transitionName="toast-transition" component="ul">{xList}</ReactCSSTransitionGroup>
        </div>

        return xMarkup;
    },
    handleCloseToast: function (toastItem) {
        this.props.removeToast(toastItem);
    }
});

module.exports = {
    Control: Control,
    severity: severity
};