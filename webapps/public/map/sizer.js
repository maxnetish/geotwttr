/**
 * Created by mgordeev on 09.09.2014.
 */
var libs = require('../libs');
var $ = libs.$;
var _ = libs._;

var $mapContainer;
var $window = $(window);
var $footer = $('footer');

var doSize = _.throttle(function(){
    var h = $window.height() - $mapContainer.offset().top - $footer.height() - 20;
    $mapContainer.height(h);
}, 1000);

var bind = function(container){
   $mapContainer = $(container);
   $window.on('resize', doSize);
    doSize();
};

module.exports = {
    bind: bind
};