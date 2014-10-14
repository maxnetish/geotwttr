var libs = require('../../libs'),
    ko = libs.ko;

var Viewmodel = function (params) {


    this.filters = params.filters;
};

var createViewModel = function (params, componentInfo) {
    //return new Viewmodel(params);
    return params.filters;
};

var register = function () {
    ko.components.register('filter-settings-panel', {
        template: {
            element: 'filter-settings-panel-tpl'
        },
        viewModel: {
            createViewModel: createViewModel
        }
    });
};

module.exports = {
    register: register
};
