/**
 * Created by max on 03.01.14.
 */
define(["ko", "models", "dataservice.stream-tweets"],
    function (ko, models, srcDataservice) {
        var selectedLocationObservable= ko.observable(new models.ModelSelectedLocation());
        var listOfTweets=new models.ModelStatusesList(srcDataservice);

        selectedLocationObservable.subscribe(function(locationUnwrapped){
             listOfTweets.filter(locationUnwrapped);
        });

        var needMore=function(){
            listOfTweets.requestMorePrevious();
        };

        return {
            statusOnMap: null,
            selectedLocation: selectedLocationObservable,
            searchResult: listOfTweets.statusesList,
            searchRadius: selectedLocationObservable().radius,
            title: "Title text",
            setTweetContentWidth: function () {
                return 200;
            },
            //formatTweetDate: formatTweetDate,
            getUserHref: function () {
                return null;
            },
            showTweetOnMap: function () {
                return null;
            },
            searchButtonClick: function () {
                return null;
            },
            getStatusHref: function () {
                return null;
            },
            hidedIncomingCount: listOfTweets.hidedStatusesCount,
            displayedCount: listOfTweets.visibleStatusesCount,
            showHidedStatuses: listOfTweets.makeAllVisible,
            needMore: needMore
        };
    });