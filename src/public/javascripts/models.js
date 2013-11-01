/**
 * Created by max on 30.10.13.
 */

var models = {
    gmapState: function (center, zoom) {
        center = center || new google.maps.LatLng(0, 0);
        zoom = zoom || 5;

        var _center = ko.observable(center);
        var _zoom = ko.observable(zoom);
        var _circleVisible = ko.observable(false);
        var _circleRadius = ko.observable(3);
        var _circleCenter = ko.observable(center);

        this.center = _center;
        this.zoom = _zoom;
        this.circleVisible = _circleVisible;
        this.circleRadius = _circleRadius;
        this.circleCenter = _circleCenter;
    },
    selectedLocation: function (center, radius) {
        center = center || new google.maps.LatLng(0, 0);
        radius = radius || 1000;

        var _center = ko.observable(center),
            _radius = ko.observable(radius),
            _geoName = ko.observable("");

        this.center = _center;
        this.radius = _radius;
        this.geoName = _geoName;
    }
};