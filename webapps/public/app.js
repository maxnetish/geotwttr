var router = require('./router');
var map = require('./map');

router.run();

map.createMapIn(document.getElementById('gmap'));
map.createGeoSearchControl(document.getElementById('geo-search'));



