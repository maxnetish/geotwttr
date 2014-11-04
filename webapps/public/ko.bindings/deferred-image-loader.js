var bindingName = 'deferredImage',
    libs = require('../libs'),
    ko = libs.ko,
    $ = libs.$,
    _ = libs._;

var initFn = function (element, valueAccessor) {

};

var register = function () {
    ko.bindingHandlers[bindingName] = {
        init: initFn
    };
};

module.exports = {
    register: register
};