/**
 * server vm
 */

var config = require('../config');
var mmdbreader = require('maxmind-db-reader');
var mmdbReaderInstance;
var express = require('express');
var Q = require('q');

var getMmdbReaderInstance = function (cb) {
    if (mmdbReaderInstance) {
        cb(null, mmdbReaderInstance);
        return;
    }

    mmdbreader.open(config.geocode.database, function (err, instance) {
        mmdbReaderInstance = instance;
        cb(err, instance);
    });
};

var Vm = function (query) {
    query = query || {};

    this.title = 'Geo statuses';
    this.ipGeocode = null;
    this.langCode = 'en';
    this.userInfo = null;
    this.googleAPiToken = null;
    this.authSuccess = false;
    this.authError = null;
    this.developmentMode = !!query.debug || express().get('env') === 'development';
};

Vm.prototype.setTitle = function (title) {
    this.title = title;
    return this;
};
Vm.prototype.promiseSetIpGeocode = function (ip) {
    var self = this,
        dfr = Q.defer();

    // switch off
    //if (ip) {
    //    getMmdbReaderInstance(function (err1, instance) {
    //        if (err1) {
    //            dfr.reject(err1);
    //            return;
    //        }
    //        instance.getGeoData(ip, function (err2, result) {
    //            if (err2) {
    //                dfr.reject(err2);
    //                return;
    //            }
    //            self.ipGeocode = JSON.stringify(result);
    //            dfr.resolve(self);
    //        });
    //    });
    //} else {
    //    dfr.resolve(self);
    //}

    self.ipGeocode = '{}';
    dfr.resolve(self);
    return dfr.promise;
};
Vm.prototype.setLangCode = function (langCode) {
    this.langCode = langCode;
    return this;
};
Vm.prototype.setUserInfo = function (userInfo) {
    this.userInfo = userInfo;
    this.authSuccess = !!userInfo;
    return this;
};
Vm.prototype.setGoogleAPiToken = function () {
    this.googleAPiToken = config.google.apiKey;
    return this;
};
Vm.prototype.setAuthError = function (message) {
    this.authError = message;
    return this;
};

module.exports = Vm;