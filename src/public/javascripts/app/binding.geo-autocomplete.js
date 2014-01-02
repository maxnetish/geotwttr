/**
 * Created by max on 02.01.14.
 */

(function () {
    ko.bindingHandlers.geoAutocomplete = {
        init: function (element, valueAccessor) {
            var selector = valueAccessor();
            var elementWithMap = $(selector);

            var initAutocomplete = function () {
                //console.log("[MAPS] try to init autocomplete...");
                var map = elementWithMap.data('gmap');
                if (!map) {
                    //console.log("[MAPS] map not ready yet, wait 2s...")
                    setTimeout(function () {
                        initAutocomplete();
                    }, 2000);
                    return;
                }
                //console.log("[MAPS] map raedy, init autocplete");
                var autocomplete = new google.maps.places.Autocomplete(element);
                autocomplete.bindTo('bounds', map);
                google.maps.event.addListener(autocomplete, 'place_changed', function () {
                    var place = autocomplete.getPlace();
                    //console.dir(place);
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