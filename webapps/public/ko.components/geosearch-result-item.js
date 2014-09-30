/**
 * Created by mgordeev on 22.09.2014.
 */

var ko = require('../libs').ko;
var _ = require('../libs')._;

var GeocoderResultTypes = {
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
    }
};

var GeocoderResult = function (params) {
    _.extend(this, params.item);

    var countryAddressComponent = _.find(this.address_components, function (addr_comp) {
        return _.some(addr_comp.types, function (t) {
            return 'country' === t;
        });
    });

    var knownResultType = _.find(GeocoderResultTypes, function (gt, key) {
        return _.some(this.types, function (t) {
            return t === key;
        });
    }, this);

    this.preciseCoordinates = (this.geometry && this.geometry.location_type === 'ROOFTOP') ? {
        lat: this.geometry.location.lat().toFixed(4),
        lng: this.geometry.location.lng().toFixed(4)
    } : null;

    this.icon = knownResultType ? knownResultType.icon : 'icon-map-marker';
    this.countryLabel = countryAddressComponent ? countryAddressComponent.short_name : null;
};

module.exports = {
    register: function () {
        ko.components.register('geosearch-result-item', {
            template: {
                element: 'geosearch-result-item-tpl'
            },
            viewModel: GeocoderResult
        });
    }
};