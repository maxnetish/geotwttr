/**
 * Created by max on 02.01.14.
 */

define(["ko", "gmaps", "jquery", "logger"],
    function (ko, gmaps, $, logger) {
        (function () {
            ko.bindingHandlers.gmap = {
                init: function (element, valueAccessor, allBindings) {
                    var selectedLocationObservable = valueAccessor(),
                        selectedLocation = selectedLocationObservable(),
                        selectedCenterObservable = selectedLocation.center,
                        selectedRadiusObservable = selectedLocation.radius,
                        selectedBoundsObservable = selectedLocation.bounds,
                        $element = $(element),
                        statusOnMap = allBindings().statusOnMap,

                        mapOptions = {
                            center: selectedCenterObservable(),
                            zoom: 12,
                            mapTypeId: gmaps.MapTypeId.ROADMAP,
                            streetViewControl: false,
                            rotateControl: false
                        },

                        map = new gmaps.Map(element, mapOptions),

                        circle = new gmaps.Circle({
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
                        }),

                        placePolygon = new gmaps.Polygon({
                            clickable: false,
                            draggable: false,
                            editable: false,
                            fillColor: "#2622E1",
                            fillOpacity: 0.2,
                            map: map,
                            strokeWeight: 1,
                            strokeOpacity: 1,
                            visible: false
                        }),

                        statusMarker = new gmaps.Marker({
                            animation: gmaps.Animation.DROP,  //DROP BOUNCE
                            clickable: true,
                            map: map,
                            position: selectedCenterObservable(),
                            visible: false
                        }),

                        geocoder = new gmaps.Geocoder(),

                        updateGeoName = function () {
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

                    $element.data("gmap", map);
                    $element.data("circle", circle);
                    logger.log("map ready", logger.severity.INFO, "MAP");

                    gmaps.event.addListener(map, 'click', function (mouseEvent) {
                        var clickedPosition = mouseEvent.latLng;
                        circle.setCenter(clickedPosition);
                    });

                    gmaps.event.addListener(circle, 'center_changed', function () {
                        var currentCenter = selectedCenterObservable(),
                            newCenter = circle.getCenter();
                        if (currentCenter.lat() === newCenter.lat() && currentCenter.lng() === newCenter.lng()) {
                            return;
                        }
                        selectedCenterObservable(newCenter);
                        selectedLocationObservable.valueHasMutated();
                        updateGeoName();
                    });

                    gmaps.event.addListener(circle, 'radius_changed', function () {
                        var currentRadius = selectedRadiusObservable(),
                            newRadius = Math.round(circle.getRadius());
                        if (currentRadius === newRadius) {
                            return;
                        }
                        selectedRadiusObservable(newRadius);
                        selectedLocationObservable.valueHasMutated();
                    });

                    selectedLocationObservable.subscribe(function (data) {
                        var newCenter = data.center(),
                            newRadius = data.radius();
                        map.setCenter(newCenter);
                        circle.setCenter(newCenter);
                        circle.setRadius(newRadius);
                        //rect.setBounds(data.bounds());
                        updateGeoName();
                    });

                    if (ko.isObservable(statusOnMap)) {
                        statusOnMap.subscribe(function (data) {
                            var j, jLen,
                                i, iLen,
                                newPosition,
                                tweetPath,
                                gPath;
                            if (data && data.coordinates) {
                                newPosition = new gmaps.LatLng(data.coordinates.coordinates[1], data.coordinates.coordinates[0]);
                                statusMarker.setPosition(newPosition);
                                if (data.place && data.place.name) {
                                    statusMarker.setTitle(data.place.name);
                                } else {
                                    statusMarker.setTitle(null);
                                }
                                statusMarker.setVisible(true);
                                placePolygon.setVisible(false);
                                map.panTo(newPosition);
                            } else if (data && data.place && data.place.bounding_box && data.place.bounding_box.coordinates) {
                                tweetPath = data.place.bounding_box.coordinates;
                                //array of array of [lng, lat]
                                gPath = [];
                                for (i = 0, iLen = tweetPath.length; i < iLen; i = i + 1) {
                                    gPath.push([]);
                                    for (j = 0, jLen = tweetPath[i].length; j < jLen; j = j + 1) {
                                        gPath[i].push(new gmaps.LatLng(tweetPath[i][j][1], tweetPath[i][j][0]));
                                    }
                                }
                                placePolygon.setPaths(gPath);
                                statusMarker.setVisible(false);
                                placePolygon.setVisible(true);
                            } else {
                                statusMarker.setVisible(false);
                                placePolygon.setVisible(false);
                            }
                        });
                    }
                    selectedLocationObservable.valueHasMutated();
                }
            };
        })();
    });
