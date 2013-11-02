/**
 * Created by max on 30.10.13.
 */

var vmIndex = function () {
    var self = this;

    var updateSearchResult = function () {
        var center = self.selectedLocation().center();
        var radius = self.selectedLocation().radius() / 1000;

        var searchOptions = {
            geocode: center.lat() + ',' + center.lng() + ',' + radius + 'km',
            result_type: self.searchType() //'mixed', 'popular' or 'recent'
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

                self.searchResult($.map(data.statuses, function (status) {
                    status.isRetweet = !!status.retweeted_status;
                    return status;
                }));
                //this.setTweetContentWidth();
            },
            type: 'GET',
            url: '/searchtweets'
        });
    };

    this.selectedLocation = ko.observable(new models.selectedLocation());
    this.searchResult = ko.observableArray();
    this.searchRadius = this.selectedLocation().radius;
    this.searchType = ko.observable("recent");

    this.title = ko.computed({
        read: function () {
            var geoName = self.selectedLocation().geoName();
            if (geoName.length) {
                return "Tweets near: " + geoName;
            } else {
                return "Tweets near...";
            }
        }
    });

    this.setTweetContentWidth = function () {
        var $parentUl = $("#tweet-list");
        var $tweetright = $parentUl.find(".tweet-right");

        var myWidth = $parentUl.width() - 72;
        if (myWidth < 150) {
            myWidth = 150;
        }
        $tweetright.width(myWidth);
    };
    this.formatTweetDate = function (tweet) {
        var created_at = tweet.isRetweet ? tweet.retweeted_status.created_at : tweet.created_at;
        var result = moment(created_at).fromNow();
        return result;
    };
    this.getUserHref = function (tweet, forceSender) {
        forceSender = forceSender || false;
        var result = "https://twitter.com/" + (!forceSender && tweet.isRetweet ? tweet.retweeted_status.user.screen_name : tweet.user.screen_name);
        return result;
    };
    this.showTweetOnMap = function (tweet) {
        console.dir(tweet);
    };
    this.searchButtonClick = function () {
        updateSearchResult();
    };
    this.selectedLocation.subscribe(function (data) {
        updateSearchResult();
    });
};