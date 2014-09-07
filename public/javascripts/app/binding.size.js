/**
 * Created by max on 06.01.14.
 */

define(["ko", "jquery", "underscore", "gmaps"],
    function (ko, $, _, gmaps) {
        (function () {
            ko.bindingHandlers.setHeight = {
                init: function (element, valueAccessor) {
                    var $element = $(element);
                    var needSetHeightListener = valueAccessor();
                    var $paneContainer = $element.parent(".pane");
                    var $paneChildren = $element.siblings(":visible");
                    var $window = $(window);

                    var setHeight = function () {
                        var siblingsHeight = 0;
                        $paneChildren.each(function () {
                            siblingsHeight = siblingsHeight + $(this).outerHeight(true);
                        });
                        var paneContainerOffset = $paneContainer.offset();
                        var availablePaneHeight = $window.height() - paneContainerOffset.top;
                        var availableHeightForElement = availablePaneHeight - siblingsHeight - 46;    //magic
                        $element.height(availableHeightForElement);

                        //костыль для gmap:
                        if ($element.is(".gmap")) {
                            var map = $element.data("gmap"),
                                circle = $element.data("circle"),
                                circleBounds,
                                mapBounds;
                            if (map instanceof gmaps.Map) {
                                gmaps.event.trigger(map, "resize");
                                if (circle instanceof gmaps.Circle) {
                                    circleBounds=circle.getBounds();
                                    mapBounds=map.getBounds();
                                    if(!mapBounds.contains(circleBounds.getNorthEast()) || !mapBounds.contains(circleBounds.getSouthWest())){
                                        map.fitBounds(circleBounds);
                                    }
                                }
                            }

                        }
                    };

                    _.delay(setHeight, 1500);

                    $window.on("resize", _.debounce(setHeight, 500));
                    needSetHeightListener.subscribe(function () {
                            _.delay(setHeight, 500);
                        }
                    );
                }
            };
        })();
    });