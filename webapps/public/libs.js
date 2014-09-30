/**
 * Created by Gordeev on 07.09.2014.
 */
var $ = require('jquery');
var _ = require('lodash');
var ko = require('knockout');
var pathjs = require('pathjs').pathjs;
var Q = require('q');
var gmapsLoader = require('./gmaps-lib-loader');

module.exports = {
    $: $,
    _: _,
    ko: ko,
    path: pathjs,
    Q: Q,
    promiseGmaps: gmapsLoader.getPromiseGMaps(Q),
    promiseGeocoder: gmapsLoader.getPromiseGeocoder(Q)
};