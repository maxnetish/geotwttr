var bindingName = 'datetimeText',
    libs = require('../libs'),
    ko = libs.ko,
    $ = libs.$,
    _ = libs._;

var initFn = function (element, valueAccessor) {
    var dtText = ko.unwrap(valueAccessor());

    var dt = new Date(dtText);

    $(element).text(dt.toLocaleString());
    // TODO ie didn't parse twitter date string
};

var register = function () {
    ko.bindingHandlers[bindingName] = {
        init: initFn
    };
};

module.exports = {
    register: register
};