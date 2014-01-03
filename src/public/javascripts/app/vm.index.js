/**
 * Created by max on 03.01.14.
 */
define(["ko", "models"],
    function (ko, models) {
        var selectedLocationObservable= ko.observable(new models.ModelSelectedLocation());


        return {
            statusOnMap: null,
            selectedLocation: selectedLocationObservable,
            searchResult: null,
            searchRadius: 1000,
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
            hidedIncomingCount: ko.computed({
                read: function () {
                    return null;
                }
            }),
            displayedCount: ko.computed({
                read: function () {
                    return null;
                }
            }),
            showHidedStatuses: function () {
                return null;
            },
            needMore: function () {
                return null;
            }
        };
    });