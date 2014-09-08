/**
 * Created by Gordeev on 07.09.2014.
 */

var path = require('../libs').path;
var _ = require('../libs')._;

var serializeState = function(st){
    var result = _.escape(JSON.stringify(st));
    return result;
};

var deserializeState = function(st){
    var result = JSON.parse(_.unescape(st));
    return result;
};

var onStateChange = function(){
    var stateSerialized = this.params['stateSerialized'];
};

var run = function(){

    path.map('#!/app/:stateSerialized')
        .enter(function(){})
        .to(onStateChange)
        .exit(function(){});
};

module.exports = {
    run: run
};