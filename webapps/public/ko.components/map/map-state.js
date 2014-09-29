/**
 * Created by mgordeev on 10.09.2014.
 */

var libs = require('../../libs'),
    _ = libs._,
    ko = libs.ko,
    mapSelection = require('./selection');

var gmapsNamespace,
geocoderInstance;

var reverseGeocode = function(latLng, observableToSet){
     geocoderInstance.geocode({
         location: latLng
     }, function(geoResults, status){
         console.log(geoResults);
         observableToSet(geoResults);
     });
};

var bindCenterPosition = function (map, state) {
    state.center.subscribe(function (newCenter) {
        // newCenter is {lat, lng}
        var newCenterLatLng = new gmapsNamespace.LatLng(newCenter.lat, newCenter.lng),
            currentCenter = map.getCenter();

        if (currentCenter.equals(newCenterLatLng)) {
            return;
        }

        map.setCenter(newCenterLatLng);
    });
    gmapsNamespace.event.addListener(map, 'center_changed', function () {
        var newCenterLatLng = map.getCenter(),
            plainNewCenter = {
                lat: newCenterLatLng.lat(),
                lng: newCenterLatLng.lng()
            },
            plainCurrentCenter = ko.unwrap(state.center);

        if (_.isEqual(plainNewCenter, plainCurrentCenter)) {
            return;
        }

        state.center(plainNewCenter);
    });
};

var bindZoom = function (map, state) {
    state.zoom.subscribe(function (newZoom) {
        // newZoom is int number
        var currentZoom = map.getZoom();

        if (currentZoom === newZoom) {
            return;
        }

        map.setZoom(newZoom);
    });
    gmapsNamespace.event.addListener(map, 'zoom_changed', function () {
        var newZoom = map.getZoom(),
            currentZoom = ko.unwrap(state.zoom);

        if (newZoom === currentZoom) {
            return;
        }

        state.zoom(newZoom);
    });
};

var bindSelection = function (map, state) {
    var circle = mapSelection.getSelectionCircle(map);
    state.selection.subscribe(function (newSelection) {
        // {lat, lng, radius}
        var circleCenter = circle.getCenter(),
            circleRadius = circle.getRadius(),
            currentSelection = {
                lat: circleCenter.lat(),
                lng: circleCenter.lng(),
                radius: circleRadius
            };

        if (_.isEqual(currentSelection, newSelection)) {
            return;
        }

        circle.setCenter(new gmapsNamespace.LatLng(newSelection.lat, newSelection.lng));
        circle.setRadius(newSelection.radius);

        reverseGeocode(circle.getCenter(), state.selectionGeocode);
    });
    gmapsNamespace.event.addListener(circle, 'center_changed', function () {
        var circleCenter = circle.getCenter(),
            currentSelection = ko.unwrap(state.selection),
            currentSelectionCenter = new gmapsNamespace.LatLng(currentSelection.lat, currentSelection.lng);

        if (circleCenter.equals(currentSelectionCenter)) {
            return;
        }

        state.selection({
            lat: circleCenter.lat(),
            lng: circleCenter.lng(),
            radius: circle.getRadius()
        });

        reverseGeocode(circleCenter, state.selectionGeocode);
    });
    gmapsNamespace.event.addListener(circle, 'radius_changed', function () {
        var circleRadius = circle.getRadius(),
            circleCenter = circle.getCenter(),
            currentSelection = ko.unwrap(state.selection),
            currentSelectionRadius = currentSelection.radius;

        if (circleRadius === currentSelectionRadius) {
            return;
        }

        state.selection({
            lat: circleCenter.lat(),
            lng: circleCenter.lng(),
            radius: circleRadius
        });
    });
};

var bind = function (gmaps, map, state) {
    gmapsNamespace = gmaps;
    geocoderInstance = new gmaps.Geocoder();
    bindCenterPosition(map, state);
    bindZoom(map, state);
    bindSelection(map, state);
};

module.exports = {
    bind: bind
};