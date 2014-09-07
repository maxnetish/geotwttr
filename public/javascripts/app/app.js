/**
 * Created by max on 04.11.13.
 */
(function () {
    /*  view model */
    var vmIndex = function () {

        /*  models  */
        var selectedLocationModel = function (center, radius) {
            center = center || new google.maps.LatLng(45.43, 12.33); //default: Venice
            radius = radius || 5000;

            var _center = ko.observable(center),
                _radius = ko.observable(radius),
                _geoName = ko.observable(""),
            //_bounds = ko.observable();
                _bounds = ko.computed({
                    read: function () {
                        var middleWestPoint = google.maps.geometry.spherical.computeOffset(_center(), _radius(), -90);
                        var southWestPoint = google.maps.geometry.spherical.computeOffset(middleWestPoint, _radius(), 180);
                        var middleEastPoint = google.maps.geometry.spherical.computeOffset(_center(), _radius(), 90);
                        var northEastPoint = google.maps.geometry.spherical.computeOffset(middleEastPoint, _radius(), 0);
                        var result = new google.maps.LatLngBounds(southWestPoint, northEastPoint);
                        return result;
                    }
                });

            this.center = _center;
            this.radius = _radius;
            this.geoName = _geoName;
            this.bounds = _bounds;


            console.log("[MAP] create instance of selectedLocationModel");
            console.dir(this);
        };

        //TODO: берем твиты с сервера этим объектом,
        //в процессе в result проталкиваются новые твиты
        var wsConnection = function () {
            var incoming = tweetIncoming;
            var resultStream = hidedIncoming;
            var socketUrl = "ws://127.0.0.1:3000";
            var socket;

            var initSocket = function () {
                // создать подключениеe
                socket = new WebSocket(socketUrl);
                //console.dir(socket);

                socket.onmessage = function (event) {

                    var incomingMessage = JSON.parse(event.data);
                    var status = incomingMessage.tweet;
                    var reqId = incomingMessage.requestId;

                    if (!status || !status.id) {
                        console.log("Message unknown received");
                        console.dir(event);
                        return;
                    }
                    status.isRetweet = !!status.retweeted_status;
                    status.canShowOnMap = !!status.coordinates;

                    //console.log("[MAP] add tweet to");
                    //console.dir(status.coordinates || status.place);
                    if (reqId === "rest") {
                        incoming.push(status);
                    } else if (reqId === "previous") {
                        incoming.push(status);
                    } else {
                        resultStream.push(status);
                    }
                };
                socket.onerror = function (event) {
                    console.log("Webcoket error");
                    //console.dir(event);
                };
                socket.onclose = function (event) {
                    console.log("Websocket close");
                    //console.dir(event);
                };
            };

            this.openRequest = function (selectedLocationInstance, fetchPrevious) {
                var selectedLocationUnwrapped = ko.utils.unwrapObservable(selectedLocationInstance);
                var center = selectedLocationUnwrapped.center();
                var radius = selectedLocationUnwrapped.radius() / 1000;
                var bounds = selectedLocationUnwrapped.bounds();
                if (!bounds) {
                    return;
                }
                var SWlatlng = bounds.getSouthWest();
                var NElanlng = bounds.getNorthEast();

                //console.log("openRequest, bound=" + bounds);

                var messages = [];
                if (fetchPrevious) {
                    var maxId;
                    var elemWithMinId = _.min(incoming(), function (elem) {
                        return elem.id;
                    });
                    maxId = elemWithMinId.id - 1;
                    messages.push({
                        requestUrl: "https://api.twitter.com/1.1/search/tweets.json",
                        requestMethod: "GET",
                        requestParams: {
                            geocode: center.lat() + ',' + center.lng() + ',' + radius + 'km',
                            result_type: 'recent', //'mixed', 'popular' or 'recent'
                            max_id: maxId
                        },
                        requestStream: false,
                        requestClose: false,
                        requestId: "previous"
                    });
                } else {
                    messages.push({
                        requestUrl: "https://api.twitter.com/1.1/search/tweets.json",
                        requestMethod: "GET",
                        requestParams: {
                            geocode: center.lat() + ',' + center.lng() + ',' + radius + 'km',
                            result_type: 'recent' //'mixed', 'popular' or 'recent'
                        },
                        requestStream: false,
                        requestClose: false,
                        requestId: "rest"
                    });

                    messages.push({
                        requestUrl: "https://stream.twitter.com/1.1/statuses/filter.json",
                        requestMethod: "GET",
                        requestParams: {
                            locations: SWlatlng.lng() + "," + SWlatlng.lat() + "," + NElanlng.lng() + "," + NElanlng.lat(),
                            stall_warnings: "true"
                        },
                        requestStream: true,
                        requestClose: false,
                        requestId: "stream"
                    });
                }


                if (!socket) {
                    initSocket();
                }

                switch (socket.readyState) {
                    case socket.OPEN:       // 1
                        console.log("socket.send immediate");
                        _.each(messages, function (oneMessage) {
                            socket.send(JSON.stringify(oneMessage));
                        });
                        break;
                    case socket.CONNECTING: // 0
                        socket.onopen = function () {
                            setTimeout(function () {
                                console.log("socket.send after connecting->onopen");
                                _.each(messages, function (oneMessage) {
                                    socket.send(JSON.stringify(oneMessage));
                                });
                            }, 1000);
                        };
                        break;
                    case socket.CLOSING:    // 3
                    case socket.CLOSED:     // 2
                        initSocket();
                        socket.onopen = function () {
                            setTimeout(function () {
                                console.log("socket.send after closed->onopen");
                                _.each(messages, function (oneMessage) {
                                    socket.send(JSON.stringify(oneMessage));
                                });
                            }, 1000);
                        };
                        break;
                    default:
                        console.log("Socket unknown state");
                        break;
                }
            };
        };

        /*  private methods */
        var updateSearchResult = function () {
            hidedIncoming.removeAll();
            tweetIncoming.removeAll();

            connection.openRequest(selectedLocation);
        };

        /*  public observables */
        var statusOnMap = ko.observable();
        var selectedLocation = ko.observable(new selectedLocationModel());
        var hidedIncoming = ko.observableArray();
        var tweetIncoming = ko.observableArray();
        var searchRadius = selectedLocation().radius;
        var needMoreObservable = ko.observable(false);
        var title = ko.computed({
            read: function () {
                var geoName = selectedLocation().geoName();
                if (geoName.length) {
                    return "Tweets near: " + geoName;
                } else {
                    return "Tweets near...";
                }
            }
        });

        var connection = new wsConnection();

        /*  public methods */
        var setTweetContentWidth = function () {
            var $parentUl = $("#tweet-list");
            var $tweetright = $parentUl.find(".tweet-right");

            var myWidth = $parentUl.width() - 72;
            if (myWidth < 150) {
                myWidth = 150;
            }
            $tweetright.width(myWidth);
        };
        var formatTweetDate = function (tweet) {
            var created_at = tweet.isRetweet ? tweet.retweeted_status.created_at : tweet.created_at;
            var result = moment(created_at).fromNow();
            return result;
        };
        var getUserHref = function (tweet, forceSender) {
            forceSender = forceSender || false;
            var result = "https://twitter.com/" + (!forceSender && tweet.isRetweet ? tweet.retweeted_status.user.screen_name : tweet.user.screen_name);
            return result;
        };
        var showTweetOnMap = function (tweet) {
            statusOnMap(tweet);
        };

        var searchButtonClick = function () {

        };

        var getStatusHref = function (tweet) {
            var result = "https://twitter.com/" + tweet.user.screen_name + "/status/" + tweet.id_str;
            return result;
        };

        var showHidedStatuses = function () {
            tweetIncoming.valueWillMutate();
            _.each(hidedIncoming(), function (status) {
                tweetIncoming.unshift(status);
            });
            hidedIncoming.removeAll();
            tweetIncoming.valueHasMutated();
        };


        /*  private subscriptions */
        selectedLocation.subscribe(function (data) {
            updateSearchResult();
        });


        var throttledGetMore = _.throttle(function () {
            console.log("[MAP] really call getMore");
            connection.openRequest(selectedLocation, true);
        }, 15000);
        needMoreObservable.subscribe(function () {
            throttledGetMore();
        });

        return {
            statusOnMap: statusOnMap,
            selectedLocation: selectedLocation,
            searchResult: tweetIncoming,
            searchRadius: searchRadius,
            title: title,
            setTweetContentWidth: setTweetContentWidth,
            formatTweetDate: formatTweetDate,
            getUserHref: getUserHref,
            showTweetOnMap: showTweetOnMap,
            searchButtonClick: searchButtonClick,
            getStatusHref: getStatusHref,
            hidedIncomingCount: ko.computed({
                read: function () {
                    return hidedIncoming().length;
                }
            }),
            displayedCount: ko.computed({
                read: function(){
                    return tweetIncoming().length;
                }
            }),
            showHidedStatuses: showHidedStatuses,
            needMore: needMoreObservable
        };
    };

    /*  global handlers */
    var setWidthOfTweetContent = function () {
        var $ulContainer = $("#tweet-list");
        var tweetContents = $ulContainer.find(".tweet-right");
        var width = $ulContainer.width() - 72;
        if (width < 150) {
            width = 150;
        }
        tweetContents.width(width);
        console.log("[WIDTH] set tweet content width after resize, " + width);
    };

    var resizeWillBeProcess = false;
    var resizeThrottleDelay = 500;

    /*  set global handlers  */
    $(document).ready(function () {
        ko.applyBindings(vmIndex());
    });
    $(window).on("resize", function () {
        if (resizeWillBeProcess) {
            return;
        }
        resizeWillBeProcess = true;
        setTimeout(function () {
            //setWidthOfTweetContent();
            resizeWillBeProcess = false;
        }, resizeThrottleDelay);
    });
    $(document).ajaxStart(function () {
        $(".preloader").css({visibility: 'visible'});
    });
    $(document).ajaxComplete(function (event, xhr, settings) {
        $('.preloader').css({visibility: 'hidden'});
    });
})();