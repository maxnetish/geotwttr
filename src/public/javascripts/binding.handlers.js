/**
 * Created by max on 30.10.13.
 */
(function () {
    ko.bindingHandlers.gmap = {
        init: function (element, valueAccessor, allBindings) {
            var selectedLocationObservable = valueAccessor(),
                selectedLocation = selectedLocationObservable(),
                selectedCenterObservable = selectedLocation.center,
                selectedRadiusObservable = selectedLocation.radius,
                statusOnMap = allBindings().statusOnMap;

            var mapOptions = {
                center: selectedCenterObservable(),
                zoom: 12,
                mapTypeId: google.maps.MapTypeId.ROADMAP,
                streetViewControl: false,
                rotateControl: false
            };

            var map = new google.maps.Map(element, mapOptions);

            var circle = new google.maps.Circle({
                center: selectedCenterObservable(),
                clickable: false,
                draggable: false,
                editable: true,
                fillColor: "#26AAE1",
                fillOpacity: 0.1,
                map: map,
                radius: selectedRadiusObservable(),
                visible: true,
                strokeOpacity: 0.2,
                strokeWeight: 1
            });

            var statusMarker = new google.maps.Marker({
                animation: google.maps.Animation.DROP,  //DROP BOUNCE
                clickable: true,
                map: map,
                position: selectedCenterObservable(),
                visible: false
            });

            var geocoder = new google.maps.Geocoder();

            $(element).data("gmap", map);
            $(element).data("circle", circle);
            console.log("[MAPS] map ready");

            var updateGeoName = function () {
                geocoder.geocode({
                    location: selectedCenterObservable()
                }, function (result, status) {
                    if (result.length && result[0].formatted_address) {
                        selectedLocation.geoName(result[0].formatted_address);
                    } else {
                        selectedLocation.geoName("");
                    }
                });
            };

            google.maps.event.addListener(map, 'click', function (mouseEvent) {
                var clickedPosition = mouseEvent.latLng;
                circle.setCenter(clickedPosition);
            });

            google.maps.event.addListener(circle, 'center_changed', function () {
                var currentCenter = selectedCenterObservable();
                var newCenter = circle.getCenter();
                if (currentCenter.lat() == newCenter.lat() && currentCenter.lng() == newCenter.lng()) {
                    return;
                }
                selectedCenterObservable(newCenter);
                selectedLocationObservable.valueHasMutated();
                updateGeoName();
            });

            google.maps.event.addListener(circle, 'radius_changed', function () {
                var currentRadius = selectedRadiusObservable();
                var newRadius = Math.round(circle.getRadius());
                if (currentRadius == newRadius) {
                    return;
                }
                selectedRadiusObservable(newRadius);
                selectedLocationObservable.valueHasMutated();
            });

            selectedLocationObservable.subscribe(function (data) {
                var newCenter = data.center();
                var newRadius = data.radius();
                map.setCenter(newCenter);
                circle.setCenter(newCenter);
                circle.setRadius(newRadius);
                updateGeoName();
            });

            statusOnMap.subscribe(function (data) {
                if (data && data.coordinates) {
                    var newPosition = new google.maps.LatLng(data.coordinates.coordinates[1], data.coordinates.coordinates[0]);
                    statusMarker.setPosition(newPosition);
                    if (data.place && data.place.name) {
                        statusMarker.setTitle(data.place.name);
                    } else {
                        statusMarker.setTitle(null);
                    }
                    statusMarker.setVisible(true);
                    map.panTo(newPosition);
                } else {
                    statusMarker.setVisible(false);
                }
            });
        }
    };
    ko.bindingHandlers.renderTweetTextContent = {
        init: function (element, valueAccessor) {
            var unionEntities = function (tweet, props) {
                var result = [];
                var currentEntityTypeArray;
                for (var i = 0; i < props.length; i++) {
                    currentEntityTypeArray = tweet.entities[props[i]];
                    if (currentEntityTypeArray && currentEntityTypeArray.length) {
                        $.merge(result, $.map(currentEntityTypeArray, function (entity) {
                            entity.type_of_entity = props[i];
                            return entity;
                        }));
                    }
                }
                return result;
            };
            var renderEntity = function (entity) {
                var result;
                if (entity.type_of_entity == "urls") {
                    return "<a target='_blank' class='entity url' href='" + entity.expanded_url + "'>" + entity.display_url + "</a>";
                } else if (entity.type_of_entity == "user_mentions") {
                    return "<a target='_blank' class='entity user-mention' href='https://twitter.com/" + entity.screen_name + "'>" + entity.screen_name + "</a>";
                } else if (entity.type_of_entity == "hashtags") {
                    return "<span class='entity hashtag'>" + entity.text + "</span>";
                } else if (entity.type_of_entity == "symbols") {
                    return "<span class='entity symbol'>" + entity.text + "</span>";
                } else if (entity.type_of_entity == "media") {
                    return "<a target='_blank' class='entity media' href='" + entity.expanded_url + "'>" + entity.display_url + "</a>";
                }
                else {
                    return "<span class='entity'>" + entity.text + "</span>";
                }
            };

            var $element = $(element);
            var tweet = valueAccessor();

            var isRetweet = tweet.isRetweet;
            var initialText = isRetweet ? tweet.retweeted_status.text : tweet.text;
            var initialLen = initialText.length;
            //var tweetEntities=isRetweet?tweet.retweeted_status.entities:tweet.entities;
            var resultArray = [];
            var remainText = initialText;

            var allEntities = unionEntities(isRetweet ? tweet.retweeted_status : tweet, ["media", "urls", "user_mentions", "hashtags", "symbols"]);
            allEntities.sort(function (a, b) {
                return a.indices[0] - b.indices[0];
            });

            var origStart;
            var origEnd;
            $.each(allEntities, function (ind, entity) {
                origStart = entity.indices[0];
                origEnd = entity.indices[1];
                resultArray.push(remainText.substr(0, origStart - (initialLen - remainText.length)));
                resultArray.push(renderEntity(entity));
                remainText = remainText.substr(origEnd - (initialLen - remainText.length));
            });
            resultArray.push(remainText);
            $element.html(resultArray.join(""));
        }
    };
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