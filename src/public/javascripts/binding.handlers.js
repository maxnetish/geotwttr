/**
 * Created by max on 30.10.13.
 */
(function () {
    ko.bindingHandlers.gmap = {
        init: function (element, valueAccessor, allBindings) {
            var valueAccessorUnwrapped = valueAccessor();
            var allBindingsUnwrapped=allBindings();
            var centerBinding = allBindingsUnwrapped.center;
            var centerBindingUnwrapped = centerBinding();
            var boundBinding=allBindingsUnwrapped.bound;
            var boundBindingUnwrapped=boundBinding();
            var zoomBinding=allBindingsUnwrapped.zoom;
            var zoomBindingUnwrapped=zoomBinding();
            var mapOptions = {
                center: centerBindingUnwrapped,
                zoom: 8,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            };
            var map = new google.maps.Map(element, mapOptions);
            $(element).data("gmap", map);

            google.maps.event.addListener(map, 'bounds_changed', function(){
                var newCenter=map.getCenter();
                centerBinding(newCenter);
                var newBound=map.getBounds();
                boundBinding(newBound);
                var newZoom=map.getZoom();
                zoomBinding(newZoom);
            });
        },
        update: function (element, valueAccessor, allBindings) {
            var valueAccessorUnwrapped = valueAccessor();
            var allBindingsUnwrapped=allBindings();
            var centerBinding = allBindingsUnwrapped.center;
            var centerBindingUnwrapped = centerBinding();
            var boundBinding=allBindingsUnwrapped.bound;
            var boundBindingUnwrapped=boundBinding();
            var zoomBinding=allBindingsUnwrapped.zoom;
            var zoomBindingUnwrapped=zoomBinding();
            var map= $(element).data("gmap");

            map.setCenter(centerBindingUnwrapped);
            //map.setZoom(zoomBindingUnwrapped);
            //map.setBounds(boundBindingUnwrapped);
        }
    };
})();