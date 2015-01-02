var bindingName = 'smoothShowHide',
    libs = require('../libs'),
    ko = libs.ko,
    $ = libs.$,
    _ = libs._;

var show = function ($element) {
    $element.css({
        display: ''
    });
    _.defer(function () {
        $element.css({
            opacity: ''
        });
    });

};

var hide = function ($element) {
    $element.css({
        opacity: 0
    });
    _.delay(function () {
        $element.css({
            display: 'none'
        });
    }, 500);
};

var setTransition = function ($element) {
    $element.css({
        transition: 'opacity 0.3s ease'
    });
};

var register = function () {
    ko.bindingHandlers[bindingName] = {
        init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
            setTransition($(element));
        },
        update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
            var visibleValue = ko.unwrap(valueAccessor()),
                hideOnAnyClick = !!allBindings().hideOnAnyClick;
            if (visibleValue) {
                show($(element));
                if (hideOnAnyClick) {
                    // defer - to skip current event
                    _.defer(function(){
                        $(document).on('click.' + bindingName, function (event) {
                            if ($(event.target).parents().index(element) == -1) {
                                valueAccessor()(false);
                            }
                        });
                    });
                }
            } else {
                $(document).off('.' + bindingName);
                hide($(element));
            }
        }
    };
};

module.exports = {
    register: register
};