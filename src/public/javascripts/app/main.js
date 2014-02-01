/**
 * Created by max on 03.01.14.
 */

(function () {
    requirejs.config({
        //By default load any module IDs from js/lib
        baseUrl: 'javascripts/app',
        paths: {
            async: '../lib/async',
            jquery: "//ajax.googleapis.com/ajax/libs/jquery/2.0.3/jquery",
            underscore: "//cdnjs.cloudflare.com/ajax/libs/underscore.js/1.5.2/underscore",
            ko: "//ajax.aspnetcdn.com/ajax/knockout/knockout-3.0.0.debug",
            moment: "../lib/moment-with-langs"
        },
        shim: {
            underscore: {
                exports: '_'
            }
        },
        waitSeconds: 60
    });

    define('gmaps', ['async!http://maps.googleapis.com/maps/api/js?key=AIzaSyANnIuW5Xvh3WCEH4MLU0nZTMCJDh-gDLI&sensor=true&libraries=places,geometry'],
        function () {
            // return the gmaps namespace for brevity
            return window.google.maps;
        });

    requirejs([
        'binding.gmap',
        'binding.geo-autocomplete',
        'binding.tweet-content',
        'binding.size'
    ], function () {
        //load ko custom bindings
    });

// Start the app.
    requirejs(['ko', 'vm.index'],
        function (ko, vmIndex) {
            ko.applyBindings(vmIndex);
        });


})();
