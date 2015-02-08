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

var createGoogleMapIn = function (domNode) {
    libs.promiseGmaps().then(function (gmapsNamespace) {
        gmaps = gmapsNamespace;
        var mapOptions = {
                zoom: 6,
                center: new gmaps.LatLng(37.419, -122.080),
                streetViewControl: false
            },
            selectionCircleOptions = selectionCircleOptionsInitial;
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

        gmaps.event.addListener(selectionCircle, 'center_changed', function(){
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

var MapControl = React.createClass({
    render: function () {
        console.log('render map control');
        return <div id="gmap" className="gmap">
        </div>;
    },
    componentDidMount: function () {
        // occurs once (not on server)
        createGoogleMapIn(this.getDOMNode());
        updateSelectionCircle(this.props.selection);
        setStateFn = this.props.setState;
    },
    shouldComponentUpdate: function (nextProps, nextState) {
        updateSelectionCircle(nextProps.selection);
        setStateFn = this.props.setState;
        return false;
    }
});

module.exports = {
    MapControl: MapControl
};