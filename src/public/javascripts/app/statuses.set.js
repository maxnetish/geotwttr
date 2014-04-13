/**
 * Created by max on 05.01.14.
 */
define(["ko", "underscore", "models", "jquery", "moment", "gmaps", "logger", "settings", "config"],
    function (ko, _, models, $, moment, gmaps, logger, settingsModule, config) {
        var StatusesSet = function (srcDataservice, $container, template) {
            var self = this,
                _filterModel,
                _requestsId = [],
                _statusesArray = [],
                $template = $(template),
                $upperElement = $container.children().first(),
                _restLoadingState = ko.observable(false),
                _pollNewStatusesIntervalId,
                statusSrc = {
                    NONE: 0,
                    REST: 1,
                    STREAM: 2
                },
                geocoder = new gmaps.Geocoder(),
                settings = settingsModule.settings,
                settingsArray = settingsModule.settingsArray,

                _insertIntoList = function (statusToInsert) {
                    var indexToInsert = _.sortedIndex(_statusesArray, statusToInsert, function (oneStatus) {
                            return -oneStatus.id;
                        }),
                    // В statusToInsert добавляем dom эелемент, который будет ему соответствовать
                        visible = false,
                        statusesCountUnwrapped,
                        initDom = function (status) {
                            var $newListItemElement = $template.clone();
                            ko.applyBindings(status, $newListItemElement.get(0));
                            statusToInsert.$domElement = $newListItemElement;
                            return $newListItemElement;
                        };

                    if (_statusesArray[indexToInsert] && _statusesArray[indexToInsert].id_str === statusToInsert.id_str) {
                        logger.log("Duplicate status id: " + statusToInsert.id_str, logger.severity.INFO, "STATUSES_SET");
                        return;
                    }

                    if (_statusesArray.length === 0) {
                        //$container.append($newListItemElement);
                        $upperElement.after(initDom(statusToInsert));
                    } else {
                        if (indexToInsert === 0) {
                            _statusesArray[indexToInsert].$domElement.before(initDom(statusToInsert));
                        } else {
                            _statusesArray[indexToInsert - 1].$domElement.after(initDom(statusToInsert));
                        }
                    }

                    _statusesArray.splice(indexToInsert, 0, statusToInsert);

                    if (statusToInsert.visibleCombined()) {
                        self.visibleCount(self.visibleCount() + 1);
                    } else if (!statusToInsert.visible() && statusToInsert.matchFilter()) {
                        self.hidedCount(self.hidedCount() + 1);
                    }
                    self.receivedCount(self.receivedCount() + 1);
                    //visible = _.isFunction(statusToInsert.visible) ? !!statusToInsert.visible() : true;
                    //visible = visible && statusToInsert.matchFilter();
                    //if (visible) {
                    //    statusesCountUnwrapped = self.visibleStatusesCount();
                    //    self.visibleStatusesCount(statusesCountUnwrapped + 1);
                    //} else {
                    //    statusesCountUnwrapped = self.hidedStatusesCount();
                    //    self.hidedStatusesCount(statusesCountUnwrapped + 1);
                    //}
                },

                _extractStatus = function (message) {
                    var result;
                    if (message && message.tweet) {
                        return _mapStatusObject(message.tweet);
                    }
                    return null;
                },

                _mapStatusObject = function (tweet) {
                    var result = new models.ModelTweet(tweet);
                    result.checkVisibility = _checkVisibility;
                    result.showOnMapCoord = _tweetWantsToShowCoord;
                    result.showOnMapPlace = _tweetWantsToShowPlace;
                    result.isStreactlyInArea = _isInArea(result, self.filter());
                    _applyFilterToOneTweet(result);
                    return result;
                },

                _isInArea = function (tweet, location) {
                    var gCoords, distance;
                    if (tweet && tweet.coordinates && tweet.coordinates.coordinates) {
                        gCoords = new gmaps.LatLng(tweet.coordinates.coordinates[1], tweet.coordinates.coordinates[0]);
                        distance = gmaps.geometry.spherical.computeDistanceBetween(gCoords, location.center());
                        return distance < location.radius();
                    }
                    return false;
                },

                _applyFilterToOneTweet = function (tweet) {
                    var notMatch = _.find(settingsArray, function (setting) {
                        if (setting.useForFilter()) {
                            return !setting.filterCallback(tweet, setting);
                        } else {
                            return false;
                        }
                    });
                    // console.log("[FILTER] tweet match: " + !notMatch);
                    tweet.matchFilter(!notMatch);
                },

                _tweetWantsToShowCoord = function (data, event) {
                    self.statusOnMap(data.coordinates);
                },

                _tweetWantsToShowPlace = function (data, event) {
                    self.statusOnMap(data.place);
                },

                _preprocessResponse = function (message) {
                    if (message.disconnect || message.tweet.disconnect) {
                        logger.log("Hmm... Disconnect.", logger.severity.ERROR);
                        logger.dir(message);
                        _.each(_requestsId, function (reqId) {
                            srcDataservice.disposeRequest(reqId);
                        });
                        _requestsId.length = 0;
                    }
                },

                _resetList = function () {
                    _.each(_requestsId, function (reqId) {
                        srcDataservice.disposeRequest(reqId);
                    });
                    _requestsId.length = 0;

                    _.each(_statusesArray, function (oneStatus) {
                        oneStatus.$domElement.remove();
                    });
                    _statusesArray.length = 0;

                    self.visibleCount(0);
                    self.hidedCount(0);
                    self.receivedCount(0);
                    self.statusOnMap(null);
                },

                _onReceiveMessage = function (options, message) {
                    var status, showImmediate, src;
                    options = options || {};
                    showImmediate = !!options.showImmediate;
                    src = options.src || statusSrc.NONE;
                    _preprocessResponse(message);
                    status = _extractStatus(message);
                    if (!status || !status.id) {
                        return;
                    }
                    status.visible(showImmediate);
                    status.srcApi = src;
                    _.defer(_insertIntoList, status);
                    if (showImmediate) {
                        _debounceCheckVisibilityNeeded();
                    }
                    if (showImmediate && _restLoadingState()) {
                        _restLoadingState(false);
                    }
                },

                _getOnReceiveMessageCallback = function (options) {
                    return _.partial(_onReceiveMessage, options);
                },

                _startStreaming = function () {
                    if (_requestsId.length === 0) {
                        _requestsId.push(srcDataservice.beginFilterStreamUpdates(_filterModel, _getOnReceiveMessageCallback({
                            showImmediate: false,
                            src: statusSrc.STREAM
                        })));
                    }
                },

                _stopStreaming = function () {
                    _.each(_requestsId, function (reqId) {
                        srcDataservice.disposeRequest(reqId);
                    });
                    _requestsId.length = 0;
                },

                _requestNewStatusesRest = function () {
                    var minId;

                    if (!_statusesArray.length) {
                        return;
                    }

                    minId = _.find(_statusesArray,function (oneStatus) {
                        return oneStatus.srcApi === statusSrc.REST;
                    }).id_str;
                    _requestsId.push(srcDataservice.requestSearchRestApi(_filterModel, _getOnReceiveMessageCallback({
                        showImmediate: false,
                        src: statusSrc.REST
                    }), undefined, minId));
                },

                _startPollNewStatuses = function () {
                    _stopPollNewStatuses();
                    _pollNewStatusesIntervalId = setInterval(_requestNewStatusesRest, config.newStatusesPollInterval);
                },

                _stopPollNewStatuses = function () {
                    if (_pollNewStatusesIntervalId) {
                        clearInterval(_pollNewStatusesIntervalId);
                        _pollNewStatusesIntervalId = null;
                    }
                },

                _debouncedApplyChangedFilter = _.debounce(function () {
                    var visibleCount = 0,
                        hideCount = 0;

                    _.each(_statusesArray, function (tweet) {
                        _applyFilterToOneTweet(tweet);
                        if (tweet.visibleCombined()) {
                            visibleCount = visibleCount + 1;
                        } else if (!tweet.visible() && tweet.matchFilter()) {
                            hideCount = hideCount + 1;
                        }
                        // hideCount = self.receivedCount() - visibleCount;
                    });
                    console.log("[FILTER] update counters after apply visible: " + visibleCount + " hided: " + hideCount);
                    self.visibleCount(visibleCount);
                    self.hidedCount(hideCount);

                    _.defer(_checkVisibility.valueHasMutated);

                }, 1000);

            _checkVisibility = ko.observable(false),
                _debounceCheckVisibilityNeeded = _.debounce(function () {
                    _checkVisibility.valueHasMutated();
                }, 500);

            this.requestMorePrevious = function () {
                var maxId;
                if (!_filterModel) {
                    return;
                }
                maxId = _.last(_statusesArray).id_str;
                //maxId = maxId - 1;
                _restLoadingState(true);
                _requestsId.push(srcDataservice.requestSearchRestApi(_filterModel, _getOnReceiveMessageCallback({
                    showImmediate: true,
                    src: statusSrc.REST
                }), maxId - 1));
            };

            this.filter = function (newFilterModel) {
                if (!newFilterModel) {
                    return _filterModel;
                }
                if (newFilterModel instanceof models.ModelSelection) {
                    _stopPollNewStatuses();
                    self.stopStreaming();
                    _filterModel = newFilterModel;
                    _resetList();
                    _restLoadingState(true);
                    srcDataservice.requestSearchRestApi(_filterModel, _getOnReceiveMessageCallback({
                        showImmediate: true,
                        src: statusSrc.REST
                    }));
                    if (settings.useStreamApi.value()) {
                        self.startStreaming();
                    }
                    _startPollNewStatuses();
                    return _filterModel;
                }
                throw "Unknown filter model";
            };
            this.startStreaming = _startStreaming;
            this.stopStreaming = _stopStreaming;
            this.streamActive = ko.observable(false);
            this.visibleCount = ko.observable(0);
            this.hidedCount = ko.observable(0);
            this.receivedCount = ko.observable(0);
            this.statusOnMap = ko.observable(null);
            this.makeAllVisible = function () {
                _.each(_statusesArray, function (oneStatus) {
                    if (_.isFunction(oneStatus.visible)) {
                        if (!oneStatus.visible()) {
                            oneStatus.visible(true);
                            if (oneStatus.matchFilter()) {
                                self.visibleCount(self.visibleCount() + 1);
                                self.hidedCount(self.hidedCount() - 1);
                            }
                        }
                    }
                });
                _.defer(_checkVisibility.valueHasMutated);
            };
            // this.setStreamedTweetsVisible = ko.observable(false);
            this.restLoadingState = _restLoadingState;

            settings.useStreamApi.value.subscribe(function (newVal) {
                if (newVal && _filterModel) {
                    self.startStreaming();
                }
                if (!newVal) {
                    self.stopStreaming();
                }
            });

            _.each(settingsArray, function (setting) {
                if (setting.useForFilter()) {
                    setting.value.subscribe(_debouncedApplyChangedFilter);
                }
            });
        };

        return {
            StatusesSet: StatusesSet
        };
    }
);