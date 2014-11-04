var ko = require('knockout');

var transform = function (tweet) {
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
        tweetUrl: 'https://twitter.com/' + tweet.user.screen_name + '/' + tweet.id_str,
        createdAtOriginal: originalTweet.created_at,
        place: tweet.place,
        profileSenderUrl: 'https://twitter.com/' + tweet.user.screen_name,
        senderScreenName: tweet.user.screen_name
    };
};

var createViewModel = function (params, componentInfo) {
    //return new Viewmodel(params);
    return transform(params.tweet);
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

