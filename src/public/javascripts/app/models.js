/**
 * Created by max on 03.01.14.
 */

define(["ko", "gmaps", "underscore", "moment", "jquery"],
    function (ko, gmaps, _, moment, $) {
        var twitterUrl = "https://twitter.com",
            valueOfOriginalTweet = function () {
                return this.retweeted_status || this;
            },
            momentFormat = "ddd MMM DD HH:mm:ss ZZ YYYY", // "Sun Feb 02 16:37:22 +0000 2014"
            geocoder = new gmaps.Geocoder(),
            createMediaList = function (tweet) {
                var result = [],
                    i, iLen, x;

                if (tweet && tweet.entities && tweet.entities.media) {
                    for (i = 0, iLen = tweet.entities.media.length; i < iLen; i++) {
                        result.push(new ModelMediaElement(tweet.entities.media[i]));
                    }
                }
                if (tweet && tweet.entities && tweet.entities.urls) {
                    for (i = 0, iLen = tweet.entities.urls.length; i < iLen; i++) {
                        x = tweet.entities.urls[i].expanded_url;
                        if (x.endsWith(".jpg") || x.endsWith(".jpeg") || x.endsWith(".gif") || x.endsWith(".png")) {
                            result.push(new ModelMediaElement(tweet.entities.urls[i]));
                        }
                    }
                }

                return result;
            },

            ModelMediaElement = function (mediaEntity) {
                mediaEntity = mediaEntity || {};

                this.expandedUrl = mediaEntity.expanded_url || null;
                if (mediaEntity.media_url) {
                    this.thumbnailUrl = mediaEntity.media_url + ":thumb";
                } else {
                    this.thumbnailUrl = mediaEntity.expanded_url || null;
                }
                this.mediaUrl = mediaEntity.media_url || mediaEntity.expanded_url || null;
                this.thumbnailW = mediaEntity.sizes && mediaEntity.sizes.thumb && mediaEntity.sizes.thumb.w;
                this.thumbnailH = mediaEntity.sizes && mediaEntity.sizes.thumb && mediaEntity.sizes.thumb.h;
            },

            ModelTweet = function (rowTweet) {
                rowTweet = rowTweet || {};

                var originalRowTweet = valueOfOriginalTweet.call(rowTweet);

                this.details = ko.observable(false);
                this.visible = ko.observable(false);
                this.isRetweet = !!rowTweet.retweeted_status;
                this.id_str = rowTweet.id_str;
                this.id = rowTweet.id;
                this.profileUrl = twitterUrl + "/" + originalRowTweet.user.screen_name;
                this.avatarUrl = originalRowTweet.user.profile_image_url;
                this.realFullName = originalRowTweet.user && originalRowTweet.user.name;
                this.realScreenName = originalRowTweet.user && originalRowTweet.user.screen_name;
                this.text = originalRowTweet.text;
                this.entities = originalRowTweet.entities || {};
                this.statusUrl = twitterUrl + "/" + rowTweet.user.screen_name + "/status/" + rowTweet.id_str;
                this.createdAtMoment = moment(originalRowTweet.created_at, momentFormat, "en");
                this.isRetweet = !!rowTweet.retweeted_status;
                this.profileOriginalUrl = twitterUrl + "/" + rowTweet.user.screen_name;
                this.orginalScreenName = rowTweet.user && rowTweet.user.screen_name;
                this.screenName = rowTweet.user.screen_name;
                this.nearPlace = rowTweet.place && rowTweet.place.full_name;
                if (rowTweet.coordinates && _.isArray(rowTweet.coordinates.coordinates) && rowTweet.coordinates.coordinates.length > 1) {
                    this.coordinates = rowTweet.coordinates;
                    this.geocodeObservable = ko.observable();
                    this.geocodeComputed = ko.computed({
                        read: this._readGeocodeComputed,
                        deferEvaluation: true,
                        owner: this
                    });
                }
                this.place = rowTweet.place;
                this.lang = rowTweet.lang === "und" ? null : rowTweet.lang;
                this.source = rowTweet.source;
                this.mediaList = createMediaList(originalRowTweet);
            },
            ModelSelectedLocation = function (center, radius) {
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

        ModelTweet.prototype._readGeocodeComputed = function () {
            var geocodeUnwrapped = this.geocodeObservable();
            if (_.isUndefined(geocodeUnwrapped)) {
                geocoder.geocode({
                    location: new gmaps.LatLng(this.coordinates.coordinates[1], this.coordinates.coordinates[0])
                }, _.bind(function (result, status) {
                    if (result && result.length) {
                        this.geocodeObservable(result[0].formatted_address)
                    } else {
                        this.geocodeObservable(_tweetCoordsToString(tweet));
                    }
                }, this));
                return this._coordsToString(this.coordinates);
            }
            return geocodeUnwrapped;
        };
        ModelTweet.prototype._coordsToString = function (coordinates) {
            return "Lat: " + coordinates.coordinates[1].toLocaleString() + " Lng: " + coordinates.coordinates[0].toLocaleString();
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