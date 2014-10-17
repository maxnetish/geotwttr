/**
 * Created by mgordeev on 17.10.2014.
 */

var connectTo = function () {
    var host = window.document.location.host.replace(/:.*/, '');
    var port = window.document.location.port ? ':' + window.document.location.port : '';
    var ws = new WebSocket('ws://' + host + port);

    ws.onmessage = function (event) {
        console.log(event);
    };
    ws.onopen = function(){
        ws.send(JSON.stringify({
            cmd: 'state'
        }));
    };
};

module.exports = {
    connectTo: connectTo
};