/**
 * Created by max on 03.01.14.
 */
define(["ko", "models", "statuses.set", "dataservice.stream-tweets", "jquery"],
    function (ko, models, statusesSet, srcDataservice, $) {
        var selectedLocationObservable = ko.observable(new models.ModelSelectedLocation());
        var listOfTweets = new statusesSet(srcDataservice, $("#tweet-list"), document.getElementById("tweet-template").innerHTML);
        var needSetHeight = ko.observable(false);

        selectedLocationObservable.subscribe(function (locationUnwrapped) {
            listOfTweets.filter(locationUnwrapped);
        });

        var needMore = function () {
            listOfTweets.requestMorePrevious();
        };

        var oldHidedCount = 0;
        listOfTweets.hidedStatusesCount.subscribe(function (count) {
            if (count !== oldHidedCount) {
                if (count > 0 && oldHidedCount === 0) {
                    needSetHeight.valueHasMutated();
                }
                if (count === 0 && oldHidedCount > 0) {
                    needSetHeight.valueHasMutated();
                }
            }
            oldHidedCount = count;
        })

        return {
            statusOnMap: null,
            selectedLocation: selectedLocationObservable,
            searchResult: listOfTweets.statusesList,
            searchRadius: selectedLocationObservable().radius,
            title: ko.computed({
                read: function () {
                    var selectedLocation = selectedLocationObservable();
                    if (selectedLocation.geoName()) {
                        return "Near: " + selectedLocation.geoName();
                    } else {
                        return null;
                    }
                },
                deferEvaluate: true
            }),
            setTweetContentWidth: function () {
                return 200;
            },
            showTweetOnMap: function () {
                return null;
            },
            hidedIncomingCount: listOfTweets.hidedStatusesCount,
            displayedCount: listOfTweets.visibleStatusesCount,
            showHidedStatuses: listOfTweets.makeAllVisible,
            needMore: needMore,
            startStreaming: listOfTweets.startStreaming,
            stopStreaming: listOfTweets.stopStreaming,
            statusOnMap: listOfTweets.statusOnMap,
            needSetHeight: needSetHeight,
            showTweetsImmediate: listOfTweets.setStreamedTweetsVisible
        };
    });