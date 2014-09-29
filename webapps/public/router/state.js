/**
 * Created by mgordeev on 09.09.2014.
 */

var libs = require('../libs'),
    _ = libs._,
    ko = libs.ko;

var State = function () {
    this.center = ko.observable({
        lat: -34.397,
        lng: 150.644
    });
    this.selection = ko.observable({
        lat: 0,
        lng: 0,
        radius: 0
    });
    this.zoom = ko.observable(12);
    this.selectionGeocode = ko.observable([]);
};

State.prototype.serialize = function () {
    var plain = {}, result;
    _.forOwn(this, function (value, key) {
        plain[key] = ko.unwrap(value);
    });
    result = encodeURIComponent(JSON.stringify(plain));
    return result;
};

State.prototype.updateFromSerialized = function (row) {
    var plain = {},
        self = this;
    try {
        plain = JSON.parse(decodeURIComponent(row));
    } catch (parseErr) {
        // ...
    }
    _.forOwn(plain, function (value, key) {
        var oldVal;
        if (_.has(self, key)) {
            oldVal = ko.unwrap(self[key]);
            if (!_.isEqual(oldVal, value)) {
                if (ko.isObservable(self[key])) {
                    self[key](value);
                } else {
                    self[key] = value;
                }
            }
        }
    });
    return this;
};

module.exports = State;