/**
 * Created by max on 03.01.14.
 */

define(["ko", "gmaps", "underscore", "moment", "jquery"],
    function (ko, gmaps, _, moment, $) {
        var instagramPatterns =
                [
                    "://instagram.com/p/",
                    "://instagr.am/p/"
                ],
            instagramEmbedUrlAddoon = "media/?size=t",
            foursquarePatterns =
                [
                    "://4sq.com/"
                ],
            ytRegexPattern = /\/\/(?:www\.)?youtu(?:\.be|be\.com)\/(?:watch\?v=|embed\/)?([a-z0-9_\-]+)/i,
            detectAndExtractYtIds = function (tweet) {
                var urls = tweet && tweet.entities && tweet.entities.urls;
                var result = [];
                _.each(urls, function (urlEntity) {
                    var matches = ytRegexPattern.exec(urlEntity.expanded_url);
                    if (matches && matches.length > 1) {
                        result.push(matches[1])
                    }
                });
                if (result.length) {
                    return result;
                }
                return null;
            },
            detectFoursquareUrl = function (urlToTest) {
                if (!_.isString(urlToTest)) {
                    return false;
                }
                return _.some(foursquarePatterns, function (pattern) {
                    return urlToTest.contains(pattern);
                });
            },
            getFoursquareCheckinData = function (shortUrl, callback) {
                callback = callback || function () {
                };
                $.ajax({
                    data: {
                        fs: shortUrl
                    },
                    dataType: 'json',
                    type: "GET",
                    url: "/fscheckin",
                    error: function (jqXHR, textStatus, errorThrown) {
                        callback(errorThrown);
                    },
                    success: function (data, textStatus, jqXHR) {
                        callback(null, data);
                    },
                    complete: function (jqXHR, textStatus) {

                    }
                });
            },
            getFoursquareUrlFrom = function (tweet) {
                var fsEntity;
                fsEntity = _.find(tweet.entities.urls, function (entity) {
                    return detectFoursquareUrl(entity.expanded_url);
                });
                if (fsEntity) {
                    return fsEntity.expanded_url;
                } else {
                    return null;
                }
            },
            detectInstagramUrl = function (urlToTest) {
                if (!_.isString(urlToTest)) {
                    return false;
                }
                return _.some(instagramPatterns, function (pattern) {
                    return urlToTest.contains(pattern);
                });
            },
            createInstagramEmbedEndpoint = function (instagramUrl) {
                if (!_.isString(instagramUrl)) {
                    return instagramUrl;
                }
                if (instagramUrl.endsWith("/")) {
                    return instagramUrl + instagramEmbedUrlAddoon;
                } else {
                    return instagramUrl + "/" + instagramEmbedUrlAddoon;
                }
            },
            twitterUrl = "https://twitter.com",
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
                        if (detectInstagramUrl(x)) {
                            tweet.entities.urls[i].media_instagram_url = createInstagramEmbedEndpoint(x);
                            result.push(new ModelMediaElement(tweet.entities.urls[i]));
                        }
                        else if (x.endsWith(".jpg") || x.endsWith(".jpeg") || x.endsWith(".gif") || x.endsWith(".png")) {
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
                } else if (mediaEntity.media_instagram_url) {
                    this.thumbnailUrl = mediaEntity.media_instagram_url;
                }
                else {
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
                this.matchFilter = ko.observable(true);
                this.visibleCombined = ko.computed({
                    read: function () {
                        return this.visible() && this.matchFilter();
                    },
                    owner: this
                });
                this.srcApi = 0;
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
                this.foursquareCheckinObservable = ko.observable();
                this.foursquareCheckinComputed = ko.computed({
                    read: this._readFoursquareCheckinComputed,
                    deferEvaluation: true,
                    owner: this
                });
                this.foursquareCheckinExists = !!getFoursquareUrlFrom(this);
                this.youtubeVideos = detectAndExtractYtIds(this);
                this.isStreactlyInArea = undefined;
            },
            ModelSelection = function (center, radius) {
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
            },
            ModelSetting = function (plainSettings) {
                plainSettings = plainSettings || {};
                this.name = plainSettings.name || "Name";
                this.value = ko.observable(plainSettings.value);
                this.type = plainSettings.type || "text";
                this.promptOrTitle = plainSettings.promptOrTitle || null;
                this.id = plainSettings.id || _.uniqueId("setting_");
                this.useForFilter = ko.observable(plainSettings.useForFilter || false);
                this.filterCallback = plainSettings.filterCallback;
                this.iconClass = plainSettings.iconClass || "icon-wrench";
                this.suggestList = ko.observableArray(plainSettings.suggestList || []);

                this.suggestListId = _.uniqueId("suggest_");
                this.checked = ko.computed({
                    read: this.readChecked,
                    write: this.writeChecked,
                    owner: this
                });
                this.realValue = ko.computed({
                    read: this.readRealValue,
                    write: this.writeRealValue,
                    owner: this
                });
            },
            ModelFoursquareCheckin = function (rowCheckin, shortUrl) {
                this.id = rowCheckin.id;
                this.checkinUrl = shortUrl;
                this.shout = rowCheckin.shout;
                this.userId = rowCheckin.user && rowCheckin.user.id;
                this.userFullName = (rowCheckin.user && rowCheckin.user.firstName) ? rowCheckin.user.firstName : "" + " " + (rowCheckin.user && rowCheckin.user.lastName) ? rowCheckin.user.lastName : "";
                if (rowCheckin.user) {
                    this.userAvatarUrl = rowCheckin.user.photo.prefix + "100x100" + rowCheckin.user.photo.suffix;
                } else {
                    this.userAvatarUrl = null;
                }
                this.venueId = rowCheckin.venue && rowCheckin.venue.id;
                this.venueName = rowCheckin.venue && rowCheckin.venue.name;
                this.venueUrl = rowCheckin.venue && ("https://foursquare.com/v/" + this.venueId);
                this.lat = (rowCheckin.location && rowCheckin.location.lat) || (rowCheckin.venue && rowCheckin.venue.location && rowCheckin.venue.location.lat);
                this.lng = (rowCheckin.location && rowCheckin.location.lng) || (rowCheckin.venue && rowCheckin.venue.location && rowCheckin.venue.location.lng);
                if (rowCheckin.venue && rowCheckin.venue.categories && rowCheckin.venue.categories.length) {
                    this.iconUrl = rowCheckin.venue.categories[0].icon.prefix + "32" + rowCheckin.venue.categories[0].icon.suffix;
                    this.venueCategoryName = rowCheckin.venue.categories[0].name;
                } else {
                    this.iconUrl = null;
                    this.venueCategoryName = null;
                }
                if (rowCheckin.photos.count) {
                    this.thumbnailUrl = rowCheckin.photos.items[0].prefix + "100x100" + rowCheckin.photos.items[0].suffix;
                } else {
                    this.thumbnailUrl = null;
                }
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
                        this.geocodeObservable(this._coordsToString(this.coordinates));
                    }
                }, this));
                return this._coordsToString(this.coordinates);
            }
            return geocodeUnwrapped;
        };
        ModelTweet.prototype._coordsToString = function (coordinates) {
            return "Lat: " + coordinates.coordinates[1].toLocaleString() + " Lng: " + coordinates.coordinates[0].toLocaleString();
        };
        ModelTweet.prototype._readFoursquareCheckinComputed = function () {
            var foursquareCheckinUnwrapped = this.foursquareCheckinObservable(),
                shortUrl,
                self = this;
            if (_.isUndefined(foursquareCheckinUnwrapped)) {
                shortUrl = getFoursquareUrlFrom(this);
                if (shortUrl) {
                    getFoursquareCheckinData(shortUrl, function (error, data) {
                        if (!error && data && data.data && data.data.response && data.data.response.checkin) {
                            self.foursquareCheckinObservable(new ModelFoursquareCheckin(data.data.response.checkin, shortUrl));
                        } else {
                            self.foursquareCheckinObservable(null);
                        }
                    });
                } else {
                    self.foursquareCheckinObservable(null);
                }
            }
            return foursquareCheckinUnwrapped;
        };

        ModelSelection.prototype.calcBounds = function () {
            var centerUnwrapped = this.center(),
                radiusUnwrapped = this.radius(),
                middleWestPoint = gmaps.geometry.spherical.computeOffset(centerUnwrapped, radiusUnwrapped, -90),
                southWestPoint = gmaps.geometry.spherical.computeOffset(middleWestPoint, radiusUnwrapped, 180),
                middleEastPoint = gmaps.geometry.spherical.computeOffset(centerUnwrapped, radiusUnwrapped, 90),
                northEastPoint = gmaps.geometry.spherical.computeOffset(middleEastPoint, radiusUnwrapped, 0),
                result = new gmaps.LatLngBounds(southWestPoint, northEastPoint);
            return result;
        };
        ModelSelection.prototype.getTwitterLocationsString = function () {
            var boundsUnwrapped = this.bounds(),
                SWlatlng = boundsUnwrapped.getSouthWest(),
                NElanlng = boundsUnwrapped.getNorthEast(),
                result = SWlatlng.lng() + "," + SWlatlng.lat() + "," + NElanlng.lng() + "," + NElanlng.lat();
            return result;
        };
        ModelSelection.prototype.getTwitterGeocodeString = function () {
            var centerUnwrapped = this.center(),
                radiusUnwrapped = this.radius(),
                result = centerUnwrapped.lat() + ',' + centerUnwrapped.lng() + ',' + (radiusUnwrapped / 1000) + 'km';
            return result;
        };

        ModelSetting.prototype.readChecked = function () {
            if (this.type === "checkbox" || this.type === "radio") {
                return this.value();
            } else {
                return null;
            }
        };
        ModelSetting.prototype.writeChecked = function (val) {
            if (this.type === "checkbox" || this.type === "radio") {
                this.value(val);
            }
        };
        ModelSetting.prototype.readRealValue = function () {
            if (this.type === "checkbox" || this.type === "radio") {
                return this.name;
            } else {
                return this.value();
            }
        };
        ModelSetting.prototype.writeRealValue = function (val) {
            if (this.type === "checkbox" || this.type === "radio") {
                // nothing, wrong case
            } else {
                this.value(val);
            }
        };

        return{
            ModelSelection: ModelSelection,
            ModelTweet: ModelTweet,
            ModelSetting: ModelSetting
        }
    });