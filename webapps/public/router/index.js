/**
 * Created by Gordeev on 07.09.2014.
 */

var path = require('../libs').path;
var _ = require('../libs')._;

var initialState = {
    zoom: 8,
    center: {
        lat: -34.397,
        lng: 150.644
    }
};

var serializeState = function (st) {
    var result = encodeURIComponent(JSON.stringify(st));
    return result;
};

var deSerializeState = function (st) {
    var result = JSON.parse(decodeURIComponent(st));
    return result;
};

var onStateChange = function () {
    var stateSerialized = this.params['stateSerialized'],
        state = deSerializeState(stateSerialized);
    console.dir(state);
};

var run = function () {

    path.map('#!/app/:stateSerialized')
        .enter(function () {})
        .to(onStateChange)
        .exit(function () {});

    path.root("#!/app/" + serializeState(initialState));

    path.rescue(function(){
        alert("404: Route Not Found");
    });

    path.listen();
};

module.exports = {
    run: run
};