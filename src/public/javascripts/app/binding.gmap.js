/**
 * Created by max on 02.01.14.
 */

define(["ko", "gmaps", "jquery"],
    function (ko, gmaps, $) {
        (function () {
            ko.bindingHandlers.gmap = {
                init: function (element, valueAccessor, allBindings) {
                    var selectedLocationObservable = valueAccessor(),
                        selectedLocation = selectedLocationObservable(),
                        selectedCenterObservable = selectedLocation.center,
                        selectedRadiusObservable = selectedLocation.radius,
                        selectedBoundsObservable = selectedLocation.bounds,
                        $element = $(element);
                    statusOnMap = allBindings().statusOnMap;

                    var mapOptions = {
                        center: selectedCenterObservable(),
                        zoom: 12,
                        mapTypeId: gmaps.MapTypeId.ROADMAP,
                        streetViewControl: false,
                        rotateControl: false
                    };

                    var map = new gmaps.Map(element, mapOptions);

                    var circle = new gmaps.Circle({
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

                    var rect = new gmaps.Rectangle({
                        bounds: selectedBoundsObservable(),
                        clickable: false,
                        draggable: false,
                        editable: false,
                        fillColor: "#86AAE1",
                        fillOpacity: 0.1,
                        map: map
                    });

                    var statusMarker = new gmaps.Marker({
                        animation: google.maps.Animation.DROP,  //DROP BOUNCE
                        clickable: true,
                        map: map,
                        position: selectedCenterObservable(),
                        visible: false
                    });

                    var geocoder = new gmaps.Geocoder();

                    $element.data("gmap", map);
                    $element.data("circle", circle);
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

                    gmaps.event.addListener(map, 'click', function (mouseEvent) {
                        var clickedPosition = mouseEvent.latLng;
                        circle.setCenter(clickedPosition);
                    });

                    gmaps.event.addListener(circle, 'center_changed', function () {
                        var currentCenter = selectedCenterObservable();
                        var newCenter = circle.getCenter();
                        if (currentCenter.lat() == newCenter.lat() && currentCenter.lng() == newCenter.lng()) {
                            return;
                        }
                        selectedCenterObservable(newCenter);
                        selectedLocationObservable.valueHasMutated();
                        updateGeoName();
                    });

                    gmaps.event.addListener(circle, 'radius_changed', function () {
                        var currentRadius = selectedRadiusObservable();
                        var newRadius = Math.round(circle.getRadius());
                        if (currentRadius == newRadius) {
                            return;
                        }
                        selectedRadiusObservable(newRadius);
                        selectedLocationObservable.valueHasMutated();
                    });

                    selectedLocationObservable.subscribe(function (data) {
                        var newCenter = data.center();
                        var newRadius = data.radius();
                        map.setCenter(newCenter);
                        circle.setCenter(newCenter);
                        circle.setRadius(newRadius);
                        rect.setBounds(data.bounds());
                        updateGeoName();
                    });

                    if (ko.isObservable(statusOnMap)) {
                        statusOnMap.subscribe(function (data) {
                            if (data && data.coordinates) {
                                var newPosition = new gmaps.LatLng(data.coordinates.coordinates[1], data.coordinates.coordinates[0]);
                                statusMarker.setPosition(newPosition);
                                if (data.place && data.place.name) {
                                    statusMarker.setTitle(data.place.name);
                                } else {
                                    statusMarker.setTitle(null);
                                }
                                statusMarker.setVisible(true);
                                map.panTo(newPosition);
                            } else {
                                statusMarker.setVisible(false);
                            }
                        });
                    }

                    selectedLocationObservable.valueHasMutated();
                }
            };
        })();
    });
