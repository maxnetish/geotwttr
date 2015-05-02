var
    _ = require('lodash'),
    React = require('react/addons'),
    actions = require('../actions'),
    DISPLAY_NAME = 'ModalMessage',
    severity = {
        WARNING: 'MODAL-WARNING',
        MESSAGE: 'MODAL-MESSAGE'
    };

var rootStore = require('../stores').rootStore;

var Control = React.createClass({
    displayName: DISPLAY_NAME,
    getDefaultProps: function () {
        return {
            severity: severity.WARNING,
            text: null,
            title: null
        };
    },
    getInitialState: function () {
        return {
            visible: false
        };
    },
    shouldComponentUpdate: function (nextProps, nextState) {
        return true;
    },
    render: function () {
        // TODO implement modal functionality

        var xMarkup = null;

        xMarkup = <div className={'modal-wrapper '+this.props.severity}>
            <div className="modal-body">
                <div className="modal-header">
                    <h4>{this.props.title}</h4>
                </div>
                <div className="modal-content">
                    <p>Text of...</p>
                </div>
                <div className="modal-footer">
                    <button type="button" onClick={this.handleClose}>OK</button>
                </div>
            </div>
        </div>

        return xMarkup;
    },
    handleClose: function () {
        this.setState({
            visible: false
        });
    }
});

module.exports = {
    Control: Control,
    severity: severity
};