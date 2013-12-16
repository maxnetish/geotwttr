/**
 * Created by max on 04.11.13.
 */
(function () {

    /*  helper  */
    var browserLocation = null;
    var helper = {
        getBrowserGeoLocation: function (defaultLanLng, callback) {
            if (browserLocation) {
                callback(browserLocation);
            }
            if (!navigator.geolocation) {
                browserLocation = defaultLanLng;
                callback(defaultLanLng);
                return;
            }
            navigator.geolocation.getCurrentPosition(function (position) {
                if (!position.coords) {
                    browserLocation = defaultLanLng;
                } else {
                    browserLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                }
                callback(browserLocation);
            });
        }
    };

    /*  view model */
    var vmIndex = function () {
        //var self = this;

        /*  models  */
        var selectedLocationModel = function (center, radius) {
            center = center || new google.maps.LatLng(0, 0);
            radius = radius || 1000;

            var _center = ko.observable(center),
                _radius = ko.observable(radius),
                _geoName = ko.observable(""),
                _bounds = ko.observable();

            this.center = _center;
            this.radius = _radius;
            this.geoName = _geoName;
            this.bounds = _bounds;
        };

        //TODO: берем твиты с сервера этим объектом,
        //в процессе в result проталкиваются новые твиты
        var wsConnection = function () {
            var result = searchResult;
            var socketUrl = "ws://127.0.0.1:3000";
            var socket;

            var initSocket = function () {
                // создать подключениеe
                socket = new WebSocket(socketUrl);
                console.dir(socket);

                socket.onmessage = function (event) {

                    var incomingMessage = event.data;
                    var status = JSON.parse(incomingMessage).tweet;
                    if(!status || !status.id){
                        console.log("Message unknown received");
                        console.dir(event);
                        return;
                    }
                    status.isRetweet = !!status.retweeted_status;
                    status.canShowOnMap = !!status.coordinates;
                    result.unshift(status);
                };
                socket.onerror = function (event) {
                    console.log("Webcoket error");
                    console.dir(event);
                };
                socket.onclose = function (event) {
                    console.log("Websocket close");
                    console.dir(event);
                };
            };

            this.openRequest = function (selectedLocationInstance) {
                var selectedLocationUnwrapped = ko.utils.unwrapObservable(selectedLocationInstance);
                var center = selectedLocationUnwrapped.center();
                var radius = selectedLocationUnwrapped.radius() / 1000;
                var bounds = selectedLocationUnwrapped.bounds();
                var SWlatlng = bounds.getSouthWest();
                var NElanlng = bounds.getNorthEast();

                console.log("openRequest, bound="+bounds);

                var messageInitial = {
                    requestUrl: "https://api.twitter.com/1.1/search/tweets.json",
                    requestMethod: "GET",
                    requestParams: {
                        geocode: center.lat() + ',' + center.lng() + ',' + radius + 'km',
                        result_type: 'recent' //'mixed', 'popular' or 'recent'
                    },
                    requestStream: false,
                    requestClose: false
                };

                var messageStream = {
                    requestUrl: "https://stream.twitter.com/1.1/statuses/filter.json",
                    requestMethod: "GET",
                    requestParams: {
                        locations: SWlatlng.lng() + "," + SWlatlng.lat() + "," + NElanlng.lng() + "," + NElanlng.lat(),
                        stall_warnings: "true"
                    },
                    requestStream: true,
                    requestClose: false
                };

                if(!socket){
                    initSocket();
                }

                switch (socket.readyState) {
                    case socket.OPEN:       // 1
                        console.log("socket.send immediate");
                        socket.send(JSON.stringify(messageInitial));
                        socket.send(JSON.stringify(messageStream));
                        break;
                    case socket.CONNECTING: // 0
                        socket.onopen =  function () {
                            setTimeout(function(){
                                console.log("socket.send after connecting->onopen");
                                socket.send(JSON.stringify(messageInitial));
                                socket.send(JSON.stringify(messageStream));
                            },1000);
                        };
                        break;
                    case socket.CLOSING:    // 3
                    case socket.CLOSED:     // 2
                        initSocket();
                        socket.onopen=function () {
                            setTimeout(function(){
                                console.log("socket.send after closed->onopen");
                                socket.send(JSON.stringify(messageInitial));
                                socket.send(JSON.stringify(messageStream));
                            },1000);
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

            searchResult.removeAll();
            connection.openRequest(selectedLocation);


            /*
            var center = selectedLocation().center();
            var radius = selectedLocation().radius() / 1000;

            var searchOptions = {
                geocode: center.lat() + ',' + center.lng() + ',' + radius + 'km',
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
                    searchResult($.map(data.statuses, function (status) {
                        status.isRetweet = !!status.retweeted_status;
                        status.canShowOnMap = !!status.coordinates || !!status.place;
                        return status;
                    }));
                    statusOnMap(null);
                },
                type: 'GET',
                url: '/searchtweets'
            });
            */
        };

        /*  public observables */
        var statusOnMap = ko.observable();
        var selectedLocation = ko.observable(new selectedLocationModel());
        var searchResult = ko.observableArray();
        var searchRadius = selectedLocation().radius;
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

        var connection=new wsConnection();

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
            //var ws = new wsConnection(searchResult);
            //updateSearchResult();
            /*
             var testWebsocket = function () {
             searchResult.removeAll();
             // создать подключение
             var socket = new WebSocket("ws://127.0.0.1:3000");
             console.dir(socket);
             socket.onopen = function (event) {
             console.log("Websocket open");
             console.dir(event);

             var center = selectedLocation().center();
             var radius = selectedLocation().radius() / 1000;
             var bounds=selectedLocation().bounds();
             var SWlatlng=bounds.getSouthWest();
             var NElanlng=bounds.getNorthEast();
             var searchOptions = {
             locations: SWlatlng.lng() + "," + SWlatlng.lat() + "," + NElanlng.lng() + "," + NElanlng.lat(),
             //locations: "-122.75,36.8,-121.75,37.8,-74,40,-73,41",
             //track: "Москве",
             stall_warnings: "true"
             //geocode: center.lat() + ',' + center.lng() + ',' + radius + 'km',
             //result_type: 'recent' //'mixed', 'popular' or 'recent'
             };

             setTimeout(function(){
             console.log("send message to server:");
             console.dir(searchOptions);
             socket.send(JSON.stringify(searchOptions));
             }, 1000);

             };
             socket.onmessage = function (event) {
             console.log("Message received");
             console.dir(event);
             var incomingMessage = event.data;
             var status = JSON.parse(incomingMessage);
             status.isRetweet = !!status.retweeted_status;
             status.canShowOnMap = !!status.coordinates;
             searchResult.unshift(status);
             };
             socket.onerror = function (event) {
             console.log("Webcoket error");
             console.dir(event);
             };
             socket.onclose = function (event) {
             console.log("Websocket close");
             console.dir(event);
             }
             };

             testWebsocket();
             */
        };

        var getStatusHref = function (tweet) {
            var result = "https://twitter.com/" + tweet.user.screen_name + "/status/" + tweet.id_str;
            return result;
        };

        /*  private subscriptions */
        selectedLocation.subscribe(function (data) {
            updateSearchResult();
        });

        /*  set map to browser location */
        helper.getBrowserGeoLocation(selectedLocation().center(), function (determinedPosition) {
            if (determinedPosition != selectedLocation().center()) {
                selectedLocation().center(determinedPosition);
                selectedLocation.valueHasMutated();
            }
        });

        return {
            statusOnMap: statusOnMap,
            selectedLocation: selectedLocation,
            searchResult: searchResult,
            searchRadius: searchRadius,
            title: title,
            setTweetContentWidth: setTweetContentWidth,
            formatTweetDate: formatTweetDate,
            getUserHref: getUserHref,
            showTweetOnMap: showTweetOnMap,
            searchButtonClick: searchButtonClick,
            getStatusHref: getStatusHref
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

    //window.app = {
    //    vm: {
    //        index: vmIndex()
    //    }
    //};

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