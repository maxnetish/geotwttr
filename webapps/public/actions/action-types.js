module.exports = {
    MAP: {
        CLICK: 'action-map-click',
        SELECTION_RADIUS_CHANGED: 'action-map-selection-radius-changed',
        SELECTION_CENTER_CHANGED: 'action-map-selection-center-changed',
        CENTER_CHANGED: 'action-map-center-changed',
        ZOOM_CHANGED: 'action-map-zoom-changed',
        LOADED: 'action-map-loaded'
    },
    SELECTION_DETAILS: {
        EXPAND_CLICK: 'action-selection-details-expand',
        DETAIL_LINE_CLICK: 'action-selection-detail-line-click'
    },
    GEOSEARCH: {
        TOKEN_CHANGED: 'action-search-token-changed',
        SELECT_ITEM: 'action-search-select-item'
    },
    TWEET_FEED_CONTROL: {
        SHOW_IMMEDIATE_CHANGED: 'action-show-immediate-changed',
        WANT_SHOW_NEW_TWEETS: 'action-want-show-new-tweets',
        WANT_RESET_TWEETS: 'action-want-reset-tweets'
    },
    TWEET: {
        PLACE_CLICK: 'action-tweet-place-click',
        COORDS_CLICK: 'action-tweet-coords-click'
    },
    TWEET_PROVIDER: {
        RECEIVE_TWEET: 'action-receive-tweet',
        RECEIVE_MESSAGE: 'action-receive-twitter-message',
        RECEIVE_ERROR: 'action-receive-twitter-error'
    }
};
