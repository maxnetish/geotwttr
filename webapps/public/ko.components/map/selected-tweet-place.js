var libs = require('../../libs'),
    _ = libs._,
    ko = libs.ko;

var namespace = 'geoTwttr';

var getMarker = function(map){
    var result;
    if(map.hasOwnProperty(namespace)){
        result = map[namespace].selectedPlaceMarker;
    }
    return result;
};

var updateMarker = function(selectedPlace){
  // TODO: дописать синхронизацию маркера с выбранными координатами
};

var init = function(map, gmaps, selectedPlaceObservable){
    if(!map.hasOwnProperty(namespace)){
        map[namespace] = {};
    }

    map[namespace].selectedPlaceMarker = new gmaps.Marker({
        animation: gmaps.Animation.DROP,
        clickable: false,
        draggable: false,
        icon: {
            path: gmaps.SymbolPath.CIRCLE
        },
        map: map,
        //position: LatLng,
        //title: '',
        visible: false
    });
};


module.exports = {
    init: init
};