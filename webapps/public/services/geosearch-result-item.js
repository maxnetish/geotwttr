var
    _ = require('lodash');

var geocoderResultTypesMap = {
    'route': {
        icon: 'icon-road'
    },
    'premise': {
        icon: 'icon-building'
    },
    'natural_feature': {
        icon: 'icon-leaf'
    },
    'bus_station': {
        icon: 'icon-automobile'
    },
    'subpremise': {
        icon: 'icon-building-o'
    },
    'point_of_interest': {
        icon: 'icon-photo'
    },
    'airport': {
        icon: 'icon-plane'
    },
    'defaultType': {
        icon: 'icon-map-marker'
    }
};

var getKnownResultType = function (searchResult) {
    return _.find(geocoderResultTypesMap, function (gt, key) {
            return _.some(searchResult.types, function (t) {
                return t === key;
            });
        }) || geocoderResultTypesMap.defaultType;
};

var getCountryAddressComponent = function (searchResult) {
    return _.find(searchResult.address_components, function (addr_comp) {
            return _.some(addr_comp.types, function (t) {
                return 'country' === t;
            });
        }) || {};
};

var GeocoderResultViewModel = function (geocoderResult) {
    console.log('GeocoderResultViewModel ctor execs');
    console.log(geocoderResult);
    _.extend(this, geocoderResult);
    console.log(this);

    this.knownType = getKnownResultType(this);
    this.countryCode = getCountryAddressComponent(this).short_name;
};

module.exports = {
    GeocoderResultViewModel: GeocoderResultViewModel
};