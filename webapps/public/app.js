/**
 * main module
 * run up
 */

// add polyfills:
require('classlist-polyfill');

var reactRoot = require('./components/index.jsx');
var appConfig = window.gt_config;

reactRoot.initInBrowser(document.getElementById('react-wrapper'), appConfig);

//setInterval(function(){
//    reactRoot.setState({
//        'now': Date.now()
//    });
//}, 1000);
//
//setInterval(function(){
//    reactRoot.setState({
//        'another now': Date.now()
//    });
//}, 1078);



