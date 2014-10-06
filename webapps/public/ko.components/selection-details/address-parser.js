
var libs = require('../../libs'),
    _ = libs._;

var mapper = {
    'street_address': [
        'street_number',
        'route'
    ],
    'postal_code': null
};

var parse = function(searchResult){
    var mainAddressType = _.first(searchResult.types),
        resultParts,
        result;

    if(mapper.hasOwnProperty(mainAddressType)){
        if(!mapper[mainAddressType]){
            return result;
        }

        resultParts = [];
        _.each(mapper[mainAddressType], function(addrComponentType){
            resultParts.push(_.find(searchResult.address_components, function(addrComponent){
               return _.some(addrComponent.types, function(t){
                   return t === addrComponentType;
               });
            }).long_name);
        });
        result = resultParts.join(' ');
        return result;
    }

    result = _.find(searchResult.address_components, function(addrComponent){
        return _.some(addrComponent.types, function(t){
            return t === mainAddressType;
        });
    }).long_name;

    return result;
};

module.exports = {
    parse: parse
};
