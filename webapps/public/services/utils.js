var centerRadiusToBounds = function(lat, lng, radius, gmaps){

    var centerLatLng = new gmaps.LatLng(lat, lng);

    middleWestPoint = gmaps.geometry.spherical.computeOffset(centerLatLng, radius, -90);
    southWestPoint = gmaps.geometry.spherical.computeOffset(middleWestPoint, radius, 180);
    middleEastPoint = gmaps.geometry.spherical.computeOffset(centerLatLng, radius, 90);
    northEastPoint = gmaps.geometry.spherical.computeOffset(middleEastPoint, radius, 0);

    result = new gmaps.LatLngBounds(southWestPoint, northEastPoint);

    return result;
};

var boundsToTwitterString = function(bounds){
    var SWlatlng = bounds.getSouthWest(),
        NElanlng = bounds.getNorthEast(),
        result = SWlatlng.lng() + "," + SWlatlng.lat() + "," + NElanlng.lng() + "," + NElanlng.lat();
    return result;
};

var polygon2Bounds = function (polygon, gmaps) {
    var bounds = new gmaps.LatLngBounds(),
        path = polygon.getPath();
    path.forEach(function (el) {
        bounds.extend(el);
    });
    return bounds;
};

module.exports = {
    centerRadiusToBounds: centerRadiusToBounds,
    boundsToTwitterString: boundsToTwitterString,
    polygon2Bounds: polygon2Bounds
};