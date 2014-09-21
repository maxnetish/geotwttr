/**
 * Created by Gordeev on 21.09.2014.
 */

var libs = require('../libs');
var $ = libs.$;

var bind = function(domElement, gmaps){
    var geocodeInstance = new gmaps.Geocoder();

    // plug plugin:
    require('select2');

    // apply plugin
    $(domElement).select2({
        minimumInputLength: 3,
        maximumInputLength: 64,
        minimumResultsForSearch: 1,
        placeholder: 'Search for place',
        allowClear: false,
        multiple: false,
        escapeMarkup: function(m) { return m; },
        id: function(obj){
            return obj.formatted_address;
        },
        formatSelection: function(obj, container){
            return obj.formatted_address;
        },
        formatResult: function(obj, container, query){
            var i, iLen;
            $('<p>').addClass('search-address').text(obj.formatted_address).appendTo(container);
            for(i = 0, iLen = obj.types.length; i< iLen; i++){
                $('<span>').addClass('search-address-tag').text(obj.types[i]).appendTo(container);
            }
            container.toggleClass('search-partial-match', obj.partial_match);

            return container.html();
//            return obj.formatted_address + ' '+obj.partial_match;
        },
        query: function(queryOpts){
            /**
             * element,
             * term,
             * page,
             * context,
             * callback ({results, more, context})
             */
            geocodeInstance.geocode({
                address: queryOpts.term
            }, function(geoResults, status){
                console.dir(geoResults);
                queryOpts.callback({
                    results: geoResults,
                    more: false
                });
            });

        }
    });
};

module.exports = {
    bind: bind
};