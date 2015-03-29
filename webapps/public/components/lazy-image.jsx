var
    DISPLAY_NAME = 'LazyImage',
    React = require('react/addons'),
    _ = require('lodash');

var beforeClass = 'lazy-image-before',
    afterClass = 'lazy-image-after',
    baseClass = 'lazy-image';

var Control = React.createClass({
        displayName: DISPLAY_NAME,
        shouldComponentUpdate: function (nextProps, nextState) {
            return this.props.imageUrl !== nextProps.imageUrl;
        },
        render: function () {
            console.log('render ' + DISPLAY_NAME);
            var localClass = [this.props.className, baseClass, beforeClass].join(' ');
            var xMarkup = <img className={localClass} src={this.props.imageUrl} onLoad={this.onImageLoad}/>;
            return xMarkup;
        },
        onImageLoad: function () {
            var node = this.getDOMNode();
            DOMTokenList.prototype.remove.call(node.classList, beforeClass);
            DOMTokenList.prototype.add.call(node.classList, afterClass);
        }
    })
    ;

module.exports = {
    Control: Control
};