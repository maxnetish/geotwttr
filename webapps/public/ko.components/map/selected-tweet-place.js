var libs = require('../../libs'),
    _ = libs._,
    ko = libs.ko;

var namespace = 'geoTwttr',
    _map,
    _gmaps;

var polygon2Bounds = function (polygon) {
    var bounds = new _gmaps.LatLngBounds(),
        path = polygon.getPath();
    path.forEach(function (el) {
        bounds.extend(el);
    });
    return bounds;
};

var getMarker = function () {
    var result;
    if (_map.hasOwnProperty(namespace)) {
        result = _map[namespace].selectedPlaceMarker;
    }
    return result;
};

var getPolygon = function () {
    var result;
    if (_map.hasOwnProperty(namespace)) {
        result = _map[namespace].selectedPlacePolygon;
    }
    return result;
};

var updateMarker = function (selectedTweet) {
    var marker = getMarker(), position;

    if (!selectedTweet.coordinates) {
        // remove marker
        marker.setVisible(false);
        return false;
    }

    position = new _gmaps.LatLng(selectedTweet.coordinates.coordinates[1], selectedTweet.coordinates.coordinates[0]);
    marker.setPosition(position);
    marker.setVisible(true);
    _map.panTo(position);
    marker.setAnimation(_gmaps.Animation.DROP);
    return true;
};

var updatePolygon = function (selectedTweet) {
    var polygon = getPolygon(),
        path;

    if (!(selectedTweet.place && selectedTweet.place.bounding_box && selectedTweet.place.bounding_box.coordinates)) {
        polygon.setVisible(false);
        return false;
    }

    path = _.map(selectedTweet.place.bounding_box.coordinates[0], function (twCoords) {
        return new _gmaps.LatLng(twCoords[1], twCoords[0]);
    });

    polygon.setPath(path);
    polygon.setVisible(true);
    _map.fitBounds(polygon2Bounds(polygon));
    return true;
};

var updatePlace = function (selectedTweet) {
    // TODO: дописать синхронизацию маркера с выбранными координатами
    if (!selectedTweet) {
        // remove marker and box
        getMarker().setVisible(false);
        getPolygon().setVisible(false);
        return;
    }

    updatePolygon(selectedTweet);
    updateMarker(selectedTweet);
};

var init = function (map, gmaps, selectedTweetObservable) {
    if (!map.hasOwnProperty(namespace)) {
        map[namespace] = {};
    }

    map[namespace].selectedPlaceMarker = new gmaps.Marker({
        //animation: gmaps.Animation.DROP,
        clickable: false,
        draggable: false,
        icon: {
            path: gmaps.SymbolPath.CIRCLE,
            scale: 10,
            fillOpacity: 0.1,
            fillColor: 'red',
            strokeOpacity: 0.5,
            strokeColor: 'red',
            strokeWeight: 4
        },
        map: map,
        //position: LatLng,
        //title: '',
        visible: false
    });

    map[namespace].selectedPlacePolygon = new gmaps.Polygon({
        clickable: false,
        draggable: false,
        editable: false,
        fillColor: 'red',
        fillOpacity: 0.1,
        geodesic: true,
        map: map,
        strokeColor: 'red',
        strokeOpacity: 0.2,
        strokeWeight: 2,
        visible: false
    });

    _map = map;
    _gmaps = gmaps;

    if (ko.isObservable(selectedTweetObservable)) {
        selectedTweetObservable.subscribe(function (newValue) {
            updatePlace(newValue);
        });
    }
};

module.exports = {
    init: init
};