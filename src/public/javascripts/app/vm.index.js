/**
 * Created by max on 03.01.14.
 */
define(["ko", "models", "statuses.set", "dataservice.stream-tweets", "jquery", "gmaps", "config", "settings"],
    function (ko, models, statusesSet, srcDataservice, $, gmaps, config, settings) {
        var selectedLocationObservable,
            listOfTweets,
            needSetHeight = ko.observable(false),
            oldHidedCount = 0,
            controlPanelHide = ko.observable(true),

            needMore = function () {
                listOfTweets.requestMorePrevious();
            },

            createLocationInstance = function () {
                var defaultLatLng,
                    defaultRadius = 5000,
                    configCoords = config.coordinates();

                if (configCoords) {
                    defaultLatLng = new gmaps.LatLng(configCoords.lat, configCoords.lng);
                }
                else if (config.ipGeocode && config.ipGeocode.location && config.ipGeocode.location.latitude && config.ipGeocode.location.longitude) {
                    defaultLatLng = new gmaps.LatLng(config.ipGeocode.location.latitude, config.ipGeocode.location.longitude);
                }
                return new models.ModelSelection(defaultLatLng, defaultRadius);
            },

            toggleControlPanel = function(){
                controlPanelHide(!controlPanelHide());
            },

            init = function () {
                selectedLocationObservable = ko.observable(createLocationInstance());
                listOfTweets = new statusesSet.StatusesSet(srcDataservice, $("#tweet-list"), document.getElementById("tweet-template").innerHTML);

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
                });
                selectedLocationObservable.subscribe(function (locationUnwrapped) {
                    listOfTweets.filter(locationUnwrapped);
                    config.coordinates({
                        lat: locationUnwrapped.center().lat(),
                        lng: locationUnwrapped.center().lng()
                    });
                });
            };

        init();

        return {
            selectedLocation: selectedLocationObservable,
            searchResult: listOfTweets.statusesList,
            searchRadius: selectedLocationObservable().radius,
            title: ko.computed({
                read: function () {
                    var selectedLocation = selectedLocationObservable();
                    if (selectedLocation.geoName()) {
                        return "Near: " + selectedLocation.geoName();
                    }
                    return null;
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
            showTweetsImmediate: listOfTweets.setStreamedTweetsVisible,
            restLoadingNow: listOfTweets.restLoadingState,
            toggleControlPanel: toggleControlPanel,
            controlPanelHide: controlPanelHide,
            settings: settings.settings
        };
    });