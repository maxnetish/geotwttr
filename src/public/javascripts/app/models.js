/**
 * Created by max on 03.01.14.
 */

define(["ko", "gmaps", "underscore", "moment", "jquery"],
    function (ko, gmaps, _, moment, $) {
        var twitterUrl = "https://twitter.com",
            valueOfOriginalTweet = function () {
                return this.retweeted_status || this;
            };

        var ModelTweet = function (rowTweet) {
            var originalRowTweet = valueOfOriginalTweet.call(rowTweet);

            this.details = ko.observable(false);
            this.visible = ko.observable(false);
            this.isRetweet = !!rowTweet.retweeted_status;
            this.id_str = rowTweet.id_str;
            this.id = rowTweet.id;
            this.profileUrl = twitterUrl + "/" + originalRowTweet.user.screen_name;
            this.avatarUrl = originalRowTweet.user.profile_image_url;
            this.realFullName = originalRowTweet.user.name;
            this.realScreenName = originalRowTweet.user.screen_name;
            this.text = originalRowTweet.text;
            this.entities = originalRowTweet.entities;
            this.statusUrl = twitterUrl + "/" + rowTweet.user.screen_name + "/status/" + rowTweet.id_str;
            this.createdAtMoment = moment(originalRowTweet.created_at, momentFormat, "en");
            this.isRetweet = !!rowTweet.retweeted_status;
            this.profileOriginalUrl = twitterUrl + "/" + rowTweet.user.screen_name;
            this.screenName = rowTweet.user.screen_name;
            this.nearPlace = rowTweet.place && rowTweet.place.full_name;
            this.coordinates = rowTweet.coordinates;
        };

        var ModelSelectedLocation = function (center, radius) {
            var self = this,
                _center,
                _radius,
                _geoName,
                _bounds,
                init = function () {
                    center = center || new gmaps.LatLng(45.43, 12.33); //default: Venice
                    radius = radius || 5000;
                    _center = ko.observable(center);
                    _radius = ko.observable(radius);
                    _geoName = ko.observable("");
                    _bounds = ko.computed({
                        read: function () {
                            return self.calcBounds();
                        },
                        deferEvaluation: true
                    });
                };

            init();

            this.center = _center;
            this.radius = _radius;
            this.geoName = _geoName;
            this.bounds = _bounds;
        };
        ModelSelectedLocation.prototype.calcBounds = function () {
            var centerUnwrapped = this.center(),
                radiusUnwrapped = this.radius(),
                middleWestPoint = gmaps.geometry.spherical.computeOffset(centerUnwrapped, radiusUnwrapped, -90),
                southWestPoint = gmaps.geometry.spherical.computeOffset(middleWestPoint, radiusUnwrapped, 180),
                middleEastPoint = gmaps.geometry.spherical.computeOffset(centerUnwrapped, radiusUnwrapped, 90),
                northEastPoint = gmaps.geometry.spherical.computeOffset(middleEastPoint, radiusUnwrapped, 0),
                result = new gmaps.LatLngBounds(southWestPoint, northEastPoint);
            return result;
        };
        ModelSelectedLocation.prototype.getTwitterLocationsString = function () {
            var boundsUnwrapped = this.bounds(),
                SWlatlng = boundsUnwrapped.getSouthWest(),
                NElanlng = boundsUnwrapped.getNorthEast(),
                result = SWlatlng.lng() + "," + SWlatlng.lat() + "," + NElanlng.lng() + "," + NElanlng.lat();
            return result;
        };
        ModelSelectedLocation.prototype.getTwitterGeocodeString = function () {
            var centerUnwrapped = this.center(),
                radiusUnwrapped = this.radius(),
                result = centerUnwrapped.lat() + ',' + centerUnwrapped.lng() + ',' + (radiusUnwrapped / 1000) + 'km';
            return result;
        };

        return{
            ModelSelectedLocation: ModelSelectedLocation,
            ModelTweet: ModelTweet
        }
    });