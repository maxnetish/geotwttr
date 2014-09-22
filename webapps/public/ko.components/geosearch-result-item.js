/**
 * Created by mgordeev on 22.09.2014.
 */

var ko = require('../libs').ko;

module.exports = {
    register: function(){
        ko.components.register('geosearch-result-item', {
            template: {
                element: 'geosearch-result-item'
            }
        });
    }
};