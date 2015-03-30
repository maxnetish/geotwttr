var
    DISPLAY_NAME = 'TweetMediaPreview',
    React = require('react/addons'),
    _ = require('lodash'),
    LazyImageControl = require('./lazy-image.jsx').Control;

var renderPreview = {
    'twitterMedia': function (twitterMediaInfo) {
        var sizeKey = 'thumb';
        var url = twitterMediaInfo.media_url + ':' + sizeKey;
        var imgStyle = {
            width: twitterMediaInfo.sizes[sizeKey].w,
            height: twitterMediaInfo.sizes[sizeKey].h
        };
        var xMarkup = <LazyImageControl imageUrl={url} className="twitter-photo-thumb" style={imgStyle}/>
        return xMarkup;
    }
};

var Control = React.createClass({
    displayName: DISPLAY_NAME,
    getDefaultProps: function () {
        return {
            mediaInfo: {}
        };
    },
    render: function () {
        var self = this;
        var xList = [];

        _.forEach(['twitterMedia'], function (mediaInfoKey) {
            xList.push(_.map(self.props.mediaInfo[mediaInfoKey], function (mi) {
                return renderPreview[mediaInfoKey](mi);
            }))
        });

        return <div>{xList}</div>;
    }
});

module.exports = {
    Control: Control
};