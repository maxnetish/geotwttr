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
                self.searchResult(data.statuses);
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
    this.formatTweetDate = function (tweet) {
        var result = moment(tweet.created_at).fromNow();
        return result;
    }
    this.searchButtonClick = function () {
        updateSearchResult();
    }
    this.selectedLocation.subscribe(function (data) {
        updateSearchResult();
    });
};