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