var libs = require('../../libs');
var ko = libs.ko;
var _ = libs._;

var rtlRegex = /^(ar|he|iw|ur)/;

var applyFilters = function (tweet, filters) {
    return function () {
        return _.all(filters, function (filter) {
            return filter.predicate(tweet);
        });
    };
};

var createVisibleComputedDefinition = function (tweet, filters) {
    return {
        read: applyFilters(tweet, filters),
        deferEvaluation: true
    };
};

var transform = function (tweet, filters) {
    var isRetweet = !!tweet.retweeted_status;
    var originalTweet = isRetweet ? tweet.retweeted_status : tweet;

    return {
        isRetweet: isRetweet,
        profileOriginalUrl: 'https://twitter.com/' + originalTweet.user.screen_name,
        avatarUrl: originalTweet.user.profile_image_url,
        userOriginalName: originalTweet.user.name,
        userOriginalScreenName: originalTweet.user.screen_name,
        textOriginal: originalTweet.text,
        entitiesOriginal: originalTweet.entities,
        tweetUrl: 'https://twitter.com/' + tweet.user.screen_name + '/status/' + tweet.id_str,
        createdAtOriginal: originalTweet.created_at,
        place: tweet.place,
        profileSenderUrl: 'https://twitter.com/' + tweet.user.screen_name,
        senderScreenName: tweet.user.screen_name,
        useRtl: detectRtl(tweet),
        shouldVisible: ko.computed(createVisibleComputedDefinition(tweet, filters))
    };
};

var detectRtl = function (tweet) {
    var lang = tweet.lang;

    if (!lang || lang === 'und') {
        return false;
    }

    if (rtlRegex.test(lang)) {
        return true;
    }

    return false;
};

var createViewModel = function (params, componentInfo) {
    //return new Viewmodel(params);
    return transform(params.tweet, params.filters);
};

var register = function () {
    ko.components.register('tweet-ui-mini', {
        template: {
            element: 'tweet-ui-mini-tpl'
        },
        viewModel: {
            createViewModel: createViewModel
        }
    });
};

module.exports = {
    register: register
};

// #3128

