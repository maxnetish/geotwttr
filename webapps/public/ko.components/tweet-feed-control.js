/**
 * params:
 *      showImmediate: observable (bool)
 *      hidedCount: observable (numeric)
 *      showHided: observable (toggle)
 *      reset: function()
 * @type {exports}
 */

var libs = require('../libs');
var ko = libs.ko;

var FeedControlViewModel = function(params, componentInfo){
    this.showImmediate = params.showImmediate;

    this.showShowButton = ko.computed({
        read: function(){
            return !!params.hidedCount();
        },
        deferEvaluation: true,
        pure: true
    });

    this.showResetButton = ko.computed({
        read: function(){
            return true;
        },
        pure: true
    });

    this.showHidedTweets = function(){
        params.showHided(!params.showHided());
    };

    this.countOfHidedTweets = params.hidedCount;
    this.reset = params.reset;
};

var createFeedControlViewModel = function (params, componentInfo) {
    return new FeedControlViewModel(params, componentInfo);
};

var register = function () {
    ko.components.register('tweet-feed-control', {
        template: {
            element: 'tweet-feed-control-tpl'
        },
        viewModel: {
            createViewModel: createFeedControlViewModel
        }
    });
};

module.exports = {
    register: register
};
