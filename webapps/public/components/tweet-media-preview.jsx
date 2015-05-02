var
    DISPLAY_NAME = 'TweetMediaPreview',
    React = require('react/addons'),
    _ = require('lodash'),
    LazyImageControl = require('./lazy-image.jsx').Control;

function renderTwitterMediaPhoto(twitterMediaInfo) {
    var sizeKey = 'thumb';
    var url = twitterMediaInfo.media_url + ':' + sizeKey;
    var imgStyle = {
        width: twitterMediaInfo.sizes[sizeKey].w,
        height: twitterMediaInfo.sizes[sizeKey].h
    };
    var xMarkup = <a key={twitterMediaInfo.id_str} href={twitterMediaInfo.expanded_url} target="_blank"><LazyImageControl imageUrl={url}
                                                                                            className="twitter-photo-thumb"
                                                                                            style={imgStyle}/></a>
    return xMarkup;
}

function renderTwitterMediaVideo(twitterMediaInfo) {
    // use 'small' size because 'thumb' size  - cropped
    var sizeKey = 'small';
    // only such url sutable for 'poster' attribute
    var posterUrl = twitterMediaInfo.media_url_https;
    var videoStyle = {
        width: twitterMediaInfo.sizes[sizeKey].w,
        height: twitterMediaInfo.sizes[sizeKey].h
    };
    var sourcesMarkup = _.map(twitterMediaInfo.video_info.variants, function (videoVariant, ind) {
        return <source key={twitterMediaInfo.id_str + '-variant-' + ind} src={videoVariant.url} type={videoVariant.content_type}/>
    });
    var xMarkup = <video key={twitterMediaInfo.id_str} controls="controls" poster={posterUrl} width={videoStyle.width} height={videoStyle.height}
                         style={videoStyle}>{sourcesMarkup}</video>
    return xMarkup;
}

var renderPreview = {
    'twitterMedia': function (twitterMediaInfo) {
        var type = twitterMediaInfo.type;
        var xMarkup;

        switch (type) {
            case 'video':
                xMarkup = renderTwitterMediaVideo(twitterMediaInfo);
                break;
            case 'animated_gif':
                // twitter store it as video
                xMarkup = renderTwitterMediaVideo(twitterMediaInfo);
                break;
            default:
                xMarkup = renderTwitterMediaPhoto(twitterMediaInfo);
                break;
        }

        return xMarkup;
    }
};

var Control = React.createClass({
    displayName: DISPLAY_NAME,
    getDefaultProps: function () {
        return {
            mediaInfo: {},
            className: 'tweet-media-preview-block'
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

        return <div className={self.props.className}>{xList}</div>;
    }
});

module.exports = {
    Control: Control
};