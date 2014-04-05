/**
 * Created by max on 05.01.14.
 */
define(["ko", "underscore", "models", "jquery", "moment", "gmaps", "logger", "config"],
    function (ko, _, models, $, moment, gmaps, logger, config) {
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
                    visible = _.isFunction(statusToInsert.visible) ? !!statusToInsert.visible() : true;
                    if (visible) {
                        statusesCountUnwrapped = self.visibleStatusesCount();
                        self.visibleStatusesCount(statusesCountUnwrapped + 1);
                    } else {
                        statusesCountUnwrapped = self.hidedStatusesCount();
                        self.hidedStatusesCount(statusesCountUnwrapped + 1);
                    }
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
                    return result;
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

                    self.hidedStatusesCount(0);
                    self.visibleStatusesCount(0);
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
                    self.startStreaming();
                    _startPollNewStatuses();
                    return _filterModel;
                }
                throw "Unknown filter model";
            };
            this.startStreaming = _startStreaming;
            this.stopStreaming = _stopStreaming;
            this.streamActive = ko.observable(false);
            this.visibleStatusesCount = ko.observable(0);
            this.hidedStatusesCount = ko.observable(0);
            this.statusOnMap = ko.observable(null);
            this.makeAllVisible = function () {
                _.each(_statusesArray, function (oneStatus) {
                    if (_.isFunction(oneStatus.visible)) {
                        if (!oneStatus.visible()) {
                            oneStatus.visible(true);
                            self.hidedStatusesCount(self.hidedStatusesCount() - 1);
                            self.visibleStatusesCount(self.visibleStatusesCount() + 1);
                        }
                    }
                });
                _.defer(_checkVisibility.valueHasMutated);
            };
            // this.setStreamedTweetsVisible = ko.observable(false);
            this.restLoadingState = _restLoadingState;
        };

        return {
            StatusesSet: StatusesSet
        };
    }
);