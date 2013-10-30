/**
 * Created by max on 30.10.13.
 */
(function () {

    var setWidthOfTweetContent = function () {
        var $ulContainer = $("#tweet-list");
        var tweetContents = $ulContainer.find(".tweet-right");
        var width = $ulContainer.width() - 72;
        if (width < 100) {
            width = 100;
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
            setWidthOfTweetContent();
            resizeWillBeProcess = false;
        }, resizeThrottleDelay);
    });

    ko.bindingHandlers.gmap = {
        init: function (element, valueAccessor) {
            var gmapStateObservable = valueAccessor();
            var gmapState = gmapStateObservable();
            var centerObservable = gmapState.center;
            var zoomObservable = gmapState.zoom;
            var circleVisibleObservable = gmapState.circleVisible;
            var circleRadiusObservable = gmapState.circleRadius;
            var circleCenterObservable = gmapState.circleCenter;
            var centerObsevableWillBeChanged = false;
            var zoomObservableWillBeChanged = false;
            var throttleDelay = 3000;

            var mapOptions = {
                center: centerObservable(),
                zoom: zoomObservable(),
                mapTypeId: google.maps.MapTypeId.ROADMAP
            };
            var map = new google.maps.Map(element, mapOptions);
            var circle = new google.maps.Circle({
                center: circleCenterObservable(),
                clickable: false,
                draggable: false,
                editable: false,
                fillColor: "#26AAE1",
                fillOpacity: 0.1,
                map: map,
                radius: circleRadiusObservable() * 1000,
                visible: circleVisibleObservable(),
                strokeOpacity: 0.2,
                strokeWeight: 1
            });
            $(element).data("gmap", map);
            $(element).data("circle", circle);
            console.log("[MAPS] map ready");

            google.maps.event.addListener(map, 'center_changed', function () {
                if (centerObsevableWillBeChanged) {
                    return;
                }
                centerObsevableWillBeChanged = true;
                setTimeout(function () {
                    centerObservable(map.getCenter());
                    centerObsevableWillBeChanged = false;
                }, throttleDelay);
            });

            google.maps.event.addListener(map, 'zoom_changed', function () {
                if (zoomObservableWillBeChanged) {
                    return;
                }
                zoomObservableWillBeChanged = true;
                setTimeout(function () {
                    zoomObservable(map.getZoom());
                    zoomObservableWillBeChanged = false;
                }, throttleDelay)
            });

            gmapStateObservable.subscribe(function () {
                map.setZoom(zoomObservable());
                map.panTo(centerObservable());
            });

            circleCenterObservable.subscribe(function (data) {
                circle.setCenter(data);
            });

            circleRadiusObservable.subscribe(function (data) {
                circle.setRadius(data * 1000);
            });

            circleVisibleObservable.subscribe(function (data) {
                circle.setVisible(data);
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