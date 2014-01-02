/**
 * Created by max on 02.01.14.
 */

(function () {
    ko.bindingHandlers.gmap = {
        init: function (element, valueAccessor, allBindings) {
            var selectedLocationObservable = valueAccessor(),
                selectedLocation = selectedLocationObservable(),
                selectedCenterObservable = selectedLocation.center,
                selectedRadiusObservable = selectedLocation.radius,
                selectedBoundsObservable = selectedLocation.bounds,

                statusOnMap = allBindings().statusOnMap;


            var mapOptions = {
                center: selectedCenterObservable(),
                zoom: 12,
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

            var rect = new google.maps.Rectangle({
                bounds: selectedBoundsObservable(),
                clickable: false,
                draggable: false,
                editable: false,
                fillColor: "#86AAE1",
                fillOpacity: 0.1,
                map: map
            });

            var statusMarker = new google.maps.Marker({
                animation: google.maps.Animation.DROP,  //DROP BOUNCE
                clickable: true,
                map: map,
                position: selectedCenterObservable(),
                visible: false
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
                var currentCenter = selectedCenterObservable();
                var newCenter = circle.getCenter();
                if (currentCenter.lat() == newCenter.lat() && currentCenter.lng() == newCenter.lng()) {
                    return;
                }
                selectedCenterObservable(newCenter);
                //console.log("Set bounds to "+circle.getBounds());
                //selectedBoundsObservable(circle.getBounds());
                selectedLocationObservable.valueHasMutated();
                updateGeoName();
            });

            google.maps.event.addListener(circle, 'radius_changed', function () {
                var currentRadius = selectedRadiusObservable();
                var newRadius = Math.round(circle.getRadius());
                if (currentRadius == newRadius) {
                    return;
                }
                //console.log("Set bounds to "+circle.getBounds());
                //selectedBoundsObservable(circle.getBounds());
                selectedRadiusObservable(newRadius);
                selectedLocationObservable.valueHasMutated();
            });

            selectedLocationObservable.subscribe(function (data) {
                console.log("[MAP] change selected location");
                console.dir(data);
                var newCenter = data.center();
                var newRadius = data.radius();
                map.setCenter(newCenter);
                circle.setCenter(newCenter);
                circle.setRadius(newRadius);
                //console.log("Set bounds to "+circle.getBounds());
                //selectedBoundsObservable(circle.getBounds());
                rect.setBounds(data.bounds());
                updateGeoName();
            });

            statusOnMap.subscribe(function (data) {
                if (data && data.coordinates) {
                    var newPosition = new google.maps.LatLng(data.coordinates.coordinates[1], data.coordinates.coordinates[0]);
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

            if (!selectedBoundsObservable()) {
                //console.log("Set bound to "+circle.getBounds());
                //selectedBoundsObservable(circle.getBounds());
            }

            selectedLocationObservable.valueHasMutated();
        }
    };
})();