/**
 * main module
 * run up
 */

var router = require('./router');
var koComponents = require('./ko.components');

router.run();

koComponents.registerComponents();
koComponents.registerApp();



