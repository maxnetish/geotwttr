/**
 * Created by max on 30.10.13.
 */

var models = {
    gmapState: function (center, zoom) {
        center = center || new google.maps.LatLng(0, 0);
        zoom = zoom || 5;

        var _center = ko.observable(center);
        var _zoom = ko.observable(zoom);

        this.center = _center;
        this.zoom = _zoom;
    }
};