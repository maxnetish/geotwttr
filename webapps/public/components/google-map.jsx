var libs = require('../libs'),
    React = libs.React,
    _ = libs._,
    actions = require('../actions'),
    mapStore = require('../stores').mapStore;

var map, selectionCircle, gmaps, selectedAreaRectangle, selectedPointMarker;

var selectionCircleOptionsInitial = {
    clickable: false,
    draggable: false,
    editable: true,
    fillColor: 'blue',
    fillOpacity: 0.1,
    radius: 1000,
    strokeColor: 'blue',
    strokeOpacity: 0.2,
    strokeWeight: 1,
    visible: false
};

var mapOptionsInitial = {
    centerUnwrapped: mapStore.getCenter(),
    zoom: mapStore.getZoom(),
    streetViewControl: false
};

var selectedAreaRectangleOptions = {
    clickable: false,
    draggable: false,
    editable: false,
    fillColor: 'red',
    fillOpacity: 0.1,
    //geodesic: true,
    strokeColor: 'red',
    strokeOpacity: 0.2,
    strokeWeight: 2,
    visible: false,
    map: null
};

var selectedPointMarkerOptions = {
    clickable: false,
    draggable: false,
    icon: {
        //path: gmaps.SymbolPath.CIRCLE,
        path: null,
        scale: 10,
        fillOpacity: 0.1,
        fillColor: 'red',
        strokeOpacity: 0.5,
        strokeColor: 'red',
        strokeWeight: 4
    },
    map: null,
    //position: LatLng,
    //title: '',
    visible: false
};

var createGoogleMapIn = function (domNode) {
    libs.promiseGmaps().then(function (gmapsNamespace) {
        gmaps = gmapsNamespace;
        var mapOptions = mapOptionsInitial,
            selectionCircleOptions = selectionCircleOptionsInitial;

        mapOptions.center = mapOptions.center || new gmaps.LatLng(mapOptions.centerUnwrapped.lat, mapOptions.centerUnwrapped.lng);
        map = new gmaps.Map(domNode, mapOptions);

        selectionCircleOptions.map = map;
        selectionCircleOptions.center = selectionCircleOptions.center || new gmaps.LatLng(0, 0);
        selectionCircle = new gmaps.Circle(selectionCircleOptions);

        selectedAreaRectangleOptions.map = map;
        selectedAreaRectangle = new gmaps.Rectangle(selectedAreaRectangleOptions);

        selectedPointMarkerOptions.map = map;
        selectedPointMarkerOptions.icon.path = gmaps.SymbolPath.CIRCLE;
        selectedPointMarker = new gmaps.Marker(selectedPointMarkerOptions);

        mapStore.on(mapStore.events.SELECTION_CHANGE, function () {
            var newSelection = mapStore.getSelection();
            console.log('catch selection CHANGE event:');
            console.log(newSelection);
            _.defer(updateSelectionCircle, newSelection);
        });

        mapStore.on(mapStore.events.CHANGE, function () {
            var newZoom = mapStore.getZoom(),
                newCenter = mapStore.getCenter();
            console.log('catch map CHANGE event');
            _.defer(updateMapCenterAndZoom, newCenter, newZoom);
        });

        mapStore.on(mapStore.events.SELECTION_AREA_CHANGE, function () {
            var selectedAreas = mapStore.getAreaSelection();
            _.defer(updateSelectedGeocoderResult, selectedAreas.geocoderResult);
        });

        gmaps.event.addListener(map, 'click', function (e) {
            var clickCoords = {
                lat: e.latLng.lat(),
                lng: e.latLng.lng()
            };
            console.log('call actions.map.click');
            actions.map.click(clickCoords);
        });

        gmaps.event.addListener(selectionCircle, 'radius_changed', function () {
            var radius = selectionCircle.getRadius();
            console.log('call actions.map.selectionRadiusChanged');
            actions.map.selectionRadiusChanged(radius);
        });

        gmaps.event.addListener(selectionCircle, 'center_changed', function () {
            var selectionCircleCenterWrapped = selectionCircle.getCenter(),
                center = {
                    lat: selectionCircleCenterWrapped.lat(),
                    lng: selectionCircleCenterWrapped.lng()
                };
            console.log('call actions.map.selectionCenterChanged');
            actions.map.selectionCenterChanged(center);
        });

        gmaps.event.addListener(map, 'center_changed', function () {
            var centerWrapped = map.getCenter();
            console.log('call action..centerChanged');
            actions.map.centerChanged({
                lat: centerWrapped.lat(),
                lng: centerWrapped.lng()
            });
        });

        gmaps.event.addListener(map, 'zoom_changed', function () {
            console.log('call action..zoomChanged');
            actions.map.zoomChanged(map.getZoom());
        });

        actions.map.loaded();
    });
};

var getCurrentSelectionFromCircle = function () {
    if (!selectionCircle) {
        return null;
    }

    var circleCenter = selectionCircle.getCenter();
    var result = {
        center: {
            lat: circleCenter.lat(),
            lng: circleCenter.lng()
        },
        radius: selectionCircle.getRadius()
    };

    return result;
};

var updateSelectionCircle = function (newSelection) {
    var currentSelection = {};

    if (!newSelection) {
        if (selectionCircle) {
            selectionCircle.setVisible(false);
        } else {
            selectionCircleOptionsInitial.visible = false;
        }
        return;
    }

    currentSelection = getCurrentSelectionFromCircle();

    if (currentSelection.center.lat !== newSelection.center.lat || currentSelection.center.lng !== newSelection.center.lng) {
        if (selectionCircle) {
            selectionCircle.setCenter(new gmaps.LatLng(newSelection.center.lat, newSelection.center.lng));
        } else {
            selectionCircleOptionsInitial.center = new gmaps.LatLng(newSelection.center.lat, newSelection.center.lng);
        }
    }

    if (currentSelection.radius !== newSelection.radius) {
        if (selectionCircle) {
            selectionCircle.setRadius(newSelection.radius);
        } else {
            selectionCircleOptionsInitial.radius = newSelection.radius;
        }
    }

    if (selectionCircle) {
        selectionCircle.setVisible(true);
    } else {
        selectionCircleOptionsInitial.visible = true;
    }
};

var updateMapCenterAndZoom = function (centerCoords, zoom) {
    console.log('updateMapCenterAndZoom:');
    console.log(centerCoords);
    console.log(zoom);
    var currentMapCenterWrapped, currentMapCenterUnwrapped, currentMapZoom;

    if (map) {
        currentMapCenterWrapped = map.getCenter();
        currentMapZoom = map.getZoom();
        currentMapCenterUnwrapped = {
            lat: currentMapCenterWrapped.lat(),
            lng: currentMapCenterWrapped.lng()
        };

        centerCoords = centerCoords || currentMapCenterUnwrapped;
        zoom = zoom || currentMapZoom;

        if (centerCoords.lat !== currentMapCenterUnwrapped.lat || centerCoords.lng !== currentMapCenterUnwrapped.lng) {
            map.panTo(new gmaps.LatLng(centerCoords.lat, centerCoords.lng));
        }

        if (zoom !== currentMapZoom) {
            map.setZoom(zoom);
        }
    } else {
        centerCoords = centerCoords || {lat: 0, lng: 0};
        zoom = zoom || 6;
        mapOptionsInitial.centerUnwrapped = centerCoords;
        mapOptionsInitial.zoom = zoom;
    }
};

var updateSelectedGeocoderResult = function (geocoderResult) {
    var hasBounds = geocoderResult && geocoderResult.geometry && geocoderResult.geometry.bounds && !geocoderResult.geometry.bounds.isEmpty(),
        hasLocation = geocoderResult && geocoderResult.geometry && geocoderResult.geometry.location,
        hasViewport = geocoderResult && geocoderResult.geometry && geocoderResult.geometry.viewport;

    if (hasBounds) {
        selectedAreaRectangle.setBounds(geocoderResult.geometry.bounds);
        selectedAreaRectangle.setVisible(true);
    } else {
        selectedAreaRectangle.setVisible(false);
    }
    if (hasLocation && !hasBounds) {
        selectedPointMarker.setPosition(geocoderResult.geometry.location);
        selectedPointMarker.setVisible(true);
    } else {
        selectedPointMarker.setVisible(false);
    }
    if (hasViewport) {
        map.fitBounds(geocoderResult.geometry.viewport);
    }
};

var MapControl = React.createClass({
    render: function () {
        console.log('render map control');
        return <div id="gmap" className="gmap">
        </div>;
    },
    componentDidMount: function () {
        // occurs once (not on server)
        createGoogleMapIn(this.getDOMNode());
    },
    shouldComponentUpdate: function (nextProps, nextState) {
        return false;
    }
});

module.exports = {
    MapControl: MapControl
};