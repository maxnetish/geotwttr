/**
 * Created by Gordeev on 07.09.2014.
 */

var libs = require('../libs'),
    path = libs.path,
    _ = libs._,
    ko = libs.ko,
    State = require('./state');

var appState = new State();
var appStateDefault = new State();

var onStateChange = function(){
    var row = this.params['stateSerialized'];
    appState.updateFromSerialized(row);
    console.dir(appState);
};

var run = function () {

    path.map('#!/app/:stateSerialized')
        .enter(function () {})
        .to(onStateChange)
        .exit(function () {});

    path.root("#!/app/" + appStateDefault.serialize());

    path.rescue(function () {
        alert("404: Route Not Found");
    });

    path.listen();
};

appState.center.subscribe(function(newVal){
    console.log('chage center:');
    console.dir(newVal);
});

appState.zoom.subscribe(function(newVal){
    console.log('change zoom:');
    console.dir(newVal);
})

module.exports = {
    run: run,
    appState: appState
};