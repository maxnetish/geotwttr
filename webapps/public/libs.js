/**
 * Created by Gordeev on 07.09.2014.
 */
var $ = require('jquery');
var _ = require('lodash');
var Q = require('q');
var React = require('react');
var gmapsLoader = require('./gmaps-lib-loader');
var flux = require('flux');
var fluxDispatcher = new flux.Dispatcher();

module.exports = {
    $: $,
    _: _,
    Q: Q,
    React: React,
    promiseGmaps: gmapsLoader.getPromiseGMaps(Q),
    promiseGeocoder: gmapsLoader.getPromiseGeocoder(Q),
    dispatcher: fluxDispatcher
};