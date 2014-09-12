/**
 * Created by mgordeev on 10.09.2014.
 */

var libs = require('../libs'),
    _ = libs._;

var namespace = 'geoTwttr';

var getSelectionCircle = function(map){
    var result;
    if(map.hasOwnProperty(namespace)){
        result = map[namespace].selection;
    }
    return result;
};

var mergeSelection = function(gmaps, map){
    if(!map.hasOwnProperty(namespace)){
        map[namespace] = {};
    }
    map[namespace].selection = new gmaps.Circle({
        center: new gmaps.LatLng(0, 0),
        clickable: false,
        draggable: false,
        editable: true,
        fillColor: '#26AAE1',
        fillOpacity: 0.1,
        map: map,
        radius: 1000,
        // strokeColor: ''
        strokeOpacity: 0.2,
        strokeWeight: 1,
        visible: false
    });

    // add click event to show selection
    gmaps.event.addListener(map, 'click', function (e){
        var newPosition = e.latLng,
            currentLatLng = map[namespace].selection.getCenter();
        console.log('map click event on: ' + newPosition.toString());
        if(newPosition.equals(currentLatLng)){
            return;
        }

        map[namespace].selection.setCenter(newPosition);
        map[namespace].selection.setVisible(true);

        // stop propagation
        // e.stop();
    });
};

module.exports = {
    init: mergeSelection,
    getSelectionCircle: getSelectionCircle
};