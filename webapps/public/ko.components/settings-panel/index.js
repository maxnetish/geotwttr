var libs = require('../../libs'),
    ko = libs.ko;


var Viewmodel = function(params){


    this.visible = params.visible;
};

var createViewModel = function(params, componentInfo){
    return new Viewmodel(params);
};

var register = function(){
      ko.components.register('settings-panel', {
         template:{
             element: 'settings-panel-tpl'
         },
          viewModel: {
              createViewModel: createViewModel
          }
      });
};

module.exports = {
  register: register
};
