/**
 * params: {
 *      notify: observable
 *      }
 * @type {string}
 *
 * When notify changes, we add toast
 */

var COMPONENT_NAME = 'toast-logger',
    TEMPLATE_ID = 'toast-logger-tpl';

var libs = require('../../libs'),
    ko = libs.ko,
    $ = libs.$,
    _ = libs._;

var ControlViewModel = function (params, componentInfo) {
    var self = this;

    this.messages = ko.observableArray();

    this.afterRenderToast = function (elements, data) {
        _.each(elements, function (el) {
            var $el = $(el);
            _.delay(function () {
                $el.removeClass('before-show');
            }, 100);
        });
    };

    this.beforeRemoveToast = function (element, index, data) {
        var $element = $(element);
        $element.addClass('before-remove');
        _.delay(function () {
            $element.remove();
        }, 500)
    };

    this.onToastTitleClick = function (data) {
        self.messages.remove(data);
    };

    if (ko.isObservable(params.notify)) {
        params.notify.subscribe(function (newMessage) {
            if (!newMessage) {
                return;
            }
            var newToast = {
                title: newMessage.title || 'Message',
                content: newMessage.content,
                'class': newMessage['class'] || 'toast-info'
            };
            var showTime = newMessage.delay || 4000;
            self.messages.unshift(newToast);
            _.delay(function () {
                self.messages.remove(newToast);
            }, showTime);
        });
    }
};

var createViewModel = function (params, componentInfo) {
    return new ControlViewModel(params, componentInfo);
};

var register = function () {
    ko.components.register(COMPONENT_NAME, {
        template: {
            element: TEMPLATE_ID
        },
        viewModel: {
            createViewModel: createViewModel
        }
    });
};

module.exports = {
    register: register
};
