/**
 * Created by max on 02.01.14.
 */

define(["ko", "gmaps", "jquery"],
    function (ko, gmaps, $) {
        (function () {
            ko.bindingHandlers.geoAutocomplete = {
                init: function (element, valueAccessor) {
                    var selector = valueAccessor();
                    var elementWithMap = $(selector);
                    var initAutocomplete = function () {
                        var map = elementWithMap.data('gmap');
                        if (!map) {
                            setTimeout(function () {
                                initAutocomplete();
                            }, 2000);
                            return;
                        }
                        var autocomplete = new gmaps.places.Autocomplete(element);
                        autocomplete.bindTo('bounds', map);
                        gmaps.event.addListener(autocomplete, 'place_changed', function () {
                            var place = autocomplete.getPlace();
                            var geometry = place.geometry || null;
                            var location = geometry.location || null;
                            var viewport = geometry.viewport || null;
                            if (viewport) {
                                map.panToBounds(viewport);
                            } else if (location) {
                                map.panTo(location);
                            }
                        });
                    };
                    initAutocomplete();
                }
            };
        })();
    });