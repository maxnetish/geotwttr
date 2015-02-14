/**
 * Created by Gordeev on 07.09.2014.
 */
var $ = require('jquery'),
    _ = require('lodash'),
    Q = require('q'),
    React = require('react'),
    gmapsLoader = require('./gmaps-lib-loader'),
    flux = require('flux'),
    fluxDispatcher = new flux.Dispatcher(),
    EventEmitter = require('events').EventEmitter;

module.exports = {
    $: $,
    _: _,
    Q: Q,
    React: React,
    promiseGmaps: gmapsLoader.getPromiseGMaps(Q),
    promiseGeocoder: gmapsLoader.getPromiseGeocoder(Q),
    dispatcher: fluxDispatcher,
    EventEmitter: EventEmitter
};