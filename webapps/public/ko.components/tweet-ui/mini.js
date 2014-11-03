var ko = require('knockout');

var createViewModel = function (params, componentInfo) {
    //return new Viewmodel(params);
    return params;
};

var register = function () {
    ko.components.register('tweet-ui-mini', {
        template: {
            element: 'tweet-ui-mini-tpl'
        },
        viewModel: {
            createViewModel: createViewModel
        }
    });
};

module.exports = {
    register: register
};

