
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

module.exports = {
    centerRadiusToBounds: centerRadiusToBounds,
    boundsToTwitterString: boundsToTwitterString
};