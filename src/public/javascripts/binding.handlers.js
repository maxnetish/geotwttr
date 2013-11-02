/**
 * Created by max on 30.10.13.
 */
(function () {

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

    ko.bindingHandlers.gmap = {
        init: function (element, valueAccessor) {
            var selectedLocationObservable = valueAccessor();
            var selectedLocation = selectedLocationObservable();
            var selectedCenterObservable = selectedLocation.center;
            //var zoomObservable = selectedLocation.zoom;
            //var circleVisibleObservable = selectedLocation.circleVisible;
            var selectedRadiusObservable = selectedLocation.radius;
            var centerObsevableWillBeChanged = false;
            var throttleDelay = 3000;

            var mapOptions = {
                center: selectedCenterObservable(),
                zoom: 6,
                mapTypeId: google.maps.MapTypeId.ROADMAP,
                streetViewControl: false,
                rotateControl: false
            };

            var map = new google.maps.Map(element, mapOptions);

            var circle = new google.maps.Circle({
                center: selectedCenterObservable(),
                clickable: false,
                draggable: false,
                editable: true,
                fillColor: "#26AAE1",
                fillOpacity: 0.1,
                map: map,
                radius: selectedRadiusObservable(),
                visible: true,
                strokeOpacity: 0.2,
                strokeWeight: 1
            });
            var geocoder = new google.maps.Geocoder();

            $(element).data("gmap", map);
            $(element).data("circle", circle);
            console.log("[MAPS] map ready");

            var updateGeoName = function () {
                geocoder.geocode({
                    location: selectedCenterObservable()
                }, function (result, status) {
                    if (result.length && result[0].formatted_address) {
                        selectedLocation.geoName(result[0].formatted_address);
                    } else {
                        selectedLocation.geoName("");
                    }
                });
            };

            google.maps.event.addListener(map, 'click', function (mouseEvent) {
                var clickedPosition = mouseEvent.latLng;
                circle.setCenter(clickedPosition);
            });

            google.maps.event.addListener(circle, 'center_changed', function () {
                selectedCenterObservable(circle.getCenter());
                selectedLocationObservable.valueHasMutated();
                updateGeoName();
            });

            google.maps.event.addListener(circle, 'radius_changed', function () {
                selectedRadiusObservable(Math.round(circle.getRadius()));
                selectedLocationObservable.valueHasMutated();
            });

            google.maps.event.addListener(map, 'center_changed', function () {

            });

            google.maps.event.addListener(map, 'zoom_changed', function () {

            });

            selectedLocationObservable.subscribe(function () {

            });
        }
        /*
         update: function (element, valueAccessor, allBindings) {
         var valueAccessorUnwrapped = valueAccessor();
         var allBindingsUnwrapped=allBindings();
         var centerBinding = allBindingsUnwrapped.center;
         var centerBindingUnwrapped = centerBinding();
         var boundBinding=allBindingsUnwrapped.bound;
         var boundBindingUnwrapped=boundBinding();
         var zoomBinding=allBindingsUnwrapped.zoom;
         var zoomBindingUnwrapped=zoomBinding();
         var map= $(element).data("gmap");

         map.setCenter(centerBindingUnwrapped);
         //map.setZoom(zoomBindingUnwrapped);
         //map.setBounds(boundBindingUnwrapped);
         }
         */

    };
    ko.bindingHandlers.renderTweetTextContent = {
        init: function (element, valueAccessor) {
            var unionEntities = function (tweet, props) {
                var result = [];
                for (var i = 0; i < props.length; i++) {
                    $.merge(result, $.map(tweet.entities[props[i]], function (entity) {
                        entity.type_of_entity = props[i];
                        return entity;
                    }));
                }
                return result;
            };
            var renderEntity = function (entity) {
                var result;
                if (entity.type_of_entity == "urls") {
                    return "<a target='_blank' class='entity url' href='" + entity.expanded_url + "'>" + entity.display_url + "</a>";
                } else if (entity.type_of_entity == "user_mentions") {
                    return "<a target='_blank' class='entity user-mention' href='https://twitter.com/" + entity.screen_name + "'>" + entity.screen_name + "</a>";
                } else if (entity.type_of_entity == "hashtags") {
                    return "<span class='entity hashtag'>" + entity.text + "</span>";
                } else if (entity.type_of_entity == "symbols") {
                    return "<span class='entity symbol'>" + entity.text + "</span>";
                } else {
                    return "<span class='entity'>" + entity.text + "</span>";
                }
            };

            var $element = $(element);
            var tweet = valueAccessor();

            var isRetweet = tweet.isRetweet;
            var initialText = isRetweet ? tweet.retweeted_status.text : tweet.text;
            var initialLen = initialText.length;
            //var tweetEntities=isRetweet?tweet.retweeted_status.entities:tweet.entities;
            var resultArray = [];
            var splitIndices = [];
            var remainText = initialText;

            var allEntities = unionEntities(isRetweet ? tweet.retweeted_status : tweet, ["urls", "user_mentions", "hashtags", "symbols"]);
            allEntities.sort(function (a, b) {
                return a.indices[0] - b.indices[0];
            });

            var origStart;
            var origEnd;
            $.each(allEntities, function (ind, entity) {
                origStart = entity.indices[0];
                origEnd = entity.indices[1];
                resultArray.push(remainText.substr(0, origStart - (initialLen - remainText.length)));
                resultArray.push(renderEntity(entity));
                remainText = remainText.substr(origEnd - (initialLen - remainText.length));
            });
            resultArray.push(remainText);
            $element.html(resultArray.join(""));
        }
    };
    ko.bindingHandlers.geoAutocomplete = {
        init: function (element, valueAccessor) {
            var selector = valueAccessor();
            var elementWithMap = $(selector);

            var initAutocomplete = function () {
                //console.log("[MAPS] try to init autocomplete...");
                var map = elementWithMap.data('gmap');
                if (!map) {
                    //console.log("[MAPS] map not ready yet, wait 2s...")
                    setTimeout(function () {
                        initAutocomplete();
                    }, 2000);
                    return;
                }
                //console.log("[MAPS] map raedy, init autocplete");
                var autocomplete = new google.maps.places.Autocomplete(element);
                autocomplete.bindTo('bounds', map);
                google.maps.event.addListener(autocomplete, 'place_changed', function () {
                    var place = autocomplete.getPlace();
                    //console.dir(place);
                    var geometry = place.geometry || null;
                    var location = geometry.location || null;
                    var viewport = geometry.viewport || null;
                    if (viewport) {
                        map.fitBounds(viewport);
                    } else if (location) {
                        map.setCenter(location);
                    }
                });
            };

            initAutocomplete();
        }
    };

})();