/**
 * Created by max on 03.01.14.
 */

define(["ko", "gmaps", "underscore"],
    function (ko, gmaps, _) {


        var ModelSelectedLocation = function (center, radius) {
            center = center || new gmaps.LatLng(45.43, 12.33); //default: Venice
            radius = radius || 5000;

            var self = this,
                _center = ko.observable(center),
                _radius = ko.observable(radius),
                _geoName = ko.observable(""),
                _bounds = ko.computed({
                    read: function () {
                        return self.calcBounds();
                    },
                    deferEvaluation: true
                });

            this.center = _center;
            this.radius = _radius;
            this.geoName = _geoName;
            this.bounds = _bounds;
        };
        ModelSelectedLocation.prototype.calcBounds = function () {
            var centerUnwrapped = this.center(),
                radiusUnwrapped = this.radius(),
                middleWestPoint = gmaps.geometry.spherical.computeOffset(centerUnwrapped, radiusUnwrapped, -90),
                southWestPoint = gmaps.geometry.spherical.computeOffset(middleWestPoint, radiusUnwrapped, 180),
                middleEastPoint = gmaps.geometry.spherical.computeOffset(centerUnwrapped, radiusUnwrapped, 90),
                northEastPoint = gmaps.geometry.spherical.computeOffset(middleEastPoint, radiusUnwrapped, 0),
                result = new gmaps.LatLngBounds(southWestPoint, northEastPoint);
            return result;
        };
        ModelSelectedLocation.prototype.getTwitterLocationsString = function () {
            var boundsUnwrapped = this.bounds();
            var SWlatlng = boundsUnwrapped.getSouthWest();
            var NElanlng = boundsUnwrapped.getNorthEast();
            var result = SWlatlng.lng() + "," + SWlatlng.lat() + "," + NElanlng.lng() + "," + NElanlng.lat();
            return result;
        };
        ModelSelectedLocation.prototype.getTwitterGeocodeString = function () {
            var centerUnwrapped = this.center();
            var radiusUnwrapped = this.radius();
            var result = centerUnwrapped.lat() + ',' + centerUnwrapped.lng() + ',' + (radiusUnwrapped / 1000) + 'km';
            return result;
        };

        return{
            ModelSelectedLocation: ModelSelectedLocation
        }
    });