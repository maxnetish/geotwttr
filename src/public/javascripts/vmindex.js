/**
 * Created by max on 30.10.13.
 */

var vmIndex = function () {
    var self = this;

    this.title = ko.observable("i'm vmIndex");
    this.gmapState = ko.observable(new models.gmapState());
    this.searchResult = ko.observableArray();
    this.setTweetContentWidth = function (element, tweet) {
        var $element = $(element);
        var $tweetright = $element.find(".tweet-right");
        var $parentUl = $element.parent();
        var myWidth = $parentUl.width() - 72;
        if (myWidth < 100) {
            myWidth = 100;
        }
        $tweetright.width(myWidth);
    };
    this.formatTweetDate=function(tweet){
        var result=moment(tweet.created_at).fromNow();
        return result;
    }
    this.gmapState().center.subscribe(function () {
        var center = self.gmapState().center();

        var searchOptions = {
            geocode: center.lat() + ',' + center.lng() + ',1km',
            result_type: 'recent' //'mixed', 'popular' or 'recent'
        };

        $.ajax({
            complete: function (xhr, status) {

            },
            data: searchOptions,
            dataType: 'json',
            error: function (xhr, status, error) {
                alert(error);
            },
            'success': function (data, status, xhr) {
                self.searchResult(data.statuses);
            },
            type: 'GET',
            url: '/searchtweets'
        });
    });
};