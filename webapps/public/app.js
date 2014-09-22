var router = require('./router');
var map = require('./map');
var koComponents = require('./ko.components');

router.run();

koComponents.registerComponents();
koComponents.registerApp();
map.createMapIn(document.getElementById('gmap'));
// map.createGeoSearchControl(document.getElementById('geo-search'));



