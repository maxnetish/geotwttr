/**
 * main module
 * run up
 */

var router = require('./router');
var koComponents = require('./ko.components');
var koBindings = require('./ko.bindings');

router.run();

koBindings.register();
koComponents.registerComponents();
koComponents.registerApp();




