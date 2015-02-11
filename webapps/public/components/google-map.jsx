var libs = require('../libs'),
    React = libs.React,
    _ = libs._;

var map, selectionCircle, gmaps, setStateFn;

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
    centerUnwrapped: {lat: 37.419, lng: -122.080},
    zoom: 6,
    streetViewControl: false
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

        gmapsNamespace.event.addListener(map, 'click', function (e) {
            var clickCoords = {
                    lat: e.latLng.lat(),
                    lng: e.latLng.lng()
                },
                radius = getCurrentSelectionFromCircle().radius;

            if (_.isFunction(setStateFn)) {
                setStateFn({
                    mapSelection: {
                        center: clickCoords,
                        radius: radius
                    }
                });
            }
        });

        gmapsNamespace.event.addListener(selectionCircle, 'radius_changed', function () {
            var currentSelection = getCurrentSelectionFromCircle();

            if (_.isFunction(setStateFn)) {
                setStateFn({
                    mapSelection: {
                        center: currentSelection.center,
                        radius: currentSelection.radius
                    }
                });
            }
        });

        gmaps.event.addListener(selectionCircle, 'center_changed', function () {
            var currentSelection = getCurrentSelectionFromCircle();

            if (_.isFunction(setStateFn)) {
                setStateFn({
                    mapSelection: {
                        center: currentSelection.center,
                        radius: currentSelection.radius
                    }
                });
            }
        });

        gmaps.event.addListener(map, 'center_changed', function () {
            var centerLatLng = map.getCenter();

            if (_.isFunction(setStateFn)) {
                setStateFn({
                    mapCenter: {
                        lat: centerLatLng.lat(),
                        lng: centerLatLng.lng()
                    }
                })
            }
        });

        gmaps.event.addListener(map, 'zoom_changed', function () {
            if (_.isFunction(setStateFn)) {
                setStateFn({
                    mapZoom: map.getZoom()
                });
            }
        });
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

var MapControl = React.createClass({
    render: function () {
        console.log('render map control');
        return <div id="gmap" className="gmap">
        </div>;
    },
    componentDidMount: function () {
        // occurs once (not on server)
        createGoogleMapIn(this.getDOMNode());
        updateMapCenterAndZoom(this.props.mapCenter, this.props.mapZoom);
        updateSelectionCircle(this.props.selection);
        setStateFn = this.props.setState;
        if (_.isFunction(setStateFn)) {
            setStateFn({
                mapLoaded: true
            });
        }
    },
    shouldComponentUpdate: function (nextProps, nextState) {
        updateMapCenterAndZoom(nextProps.mapCenter, nextProps.mapZoom);
        updateSelectionCircle(nextProps.selection);
        setStateFn = this.props.setState;
        return false;
    }
});

module.exports = {
    MapControl: MapControl
};