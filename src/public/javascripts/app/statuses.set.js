/**
 * Created by max on 05.01.14.
 */
define(["ko", "underscore", "models", "jquery", "logger"],
    function (ko, _, models, $, logger) {
        var StatusesSet = function (srcDataservice, $container, template) {
            var self = this,
                _filterModel,
                _requestsId = [],
                _statusesArray = [],
                $template = $(template),
                twitterUrl = "https://twitter.com",

                _insertIntoList = function (statusToInsert) {
                    var indexToInsert = _.sortedIndex(_statusesArray, statusToInsert, function (oneStatus) {
                            return -oneStatus.id;
                        }),
                    // В statusToInsert добавляем dom эелемент, который будет ему соответствовать
                        $newListItemElement = $template.clone(),
                        visible = false,
                        statusesCountUnwrapped;

                    ko.applyBindings(statusToInsert, $newListItemElement.get(0));
                    statusToInsert.$domElement = $newListItemElement;
                    if (_statusesArray.length === 0) {
                        $container.append($newListItemElement);
                    } else {
                        if (indexToInsert === 0) {
                            _statusesArray[indexToInsert].$domElement.before($newListItemElement);
                        } else {
                            _statusesArray[indexToInsert - 1].$domElement.after($newListItemElement);
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
                        result = message.tweet;
                        _mapStatusObject(result);
                        return result;
                    }
                    return null;
                },

                _mapStatusObject = function (tweet) {
                    tweet.isRetweet = !!tweet.retweeted_status;
                    tweet.canShowOnMap = !!(tweet.coordinates || tweet.place);
                    tweet.avatarUrl = tweet.isRetweet ?
                        tweet.retweeted_status.user.profile_image_url :
                        tweet.user.profile_image_url;
                    tweet.profileUrl = tweet.isRetweet ?
                        twitterUrl + "/" + tweet.retweeted_status.user.screen_name :
                        twitterUrl + "/" + tweet.user.screen_name;
                    tweet.profileOriginalUrl = twitterUrl + "/" + tweet.user.screen_name;
                    tweet.realFullName = tweet.isRetweet ?
                        tweet.retweeted_status.user.name :
                        tweet.user.name;
                    tweet.realScreenName = tweet.isRetweet ?
                        tweet.retweeted_status.user.screen_name :
                        tweet.user.screen_name;
                    tweet.statusUrl = twitterUrl + "/" + tweet.user.screen_name + "/status/" + tweet.id_str;
                    tweet.nearPlace = tweet.place ? tweet.place.full_name : null;
                    tweet.showOnMap = _tweetWantsToShowOnMap;
                },

                _tweetWantsToShowOnMap = function (data, event) {
                    self.statusOnMap(data);
                },

                _preprocessStreamResponse = function (message) {
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

                _onReceivedFromRest = function (message) {
                    var status = _extractStatus(message);
                    if (status && status.id) {
                        status.visible = ko.observable(true);
                        _.defer(_insertIntoList, status);
                    }
                },

                _onReceivedFromStream = function (message) {
                    _preprocessStreamResponse(message);
                    var status = _extractStatus(message);
                    if (status && status.id) {
                        if (self.setStreamedTweetsVisible()) {
                            status.visible = ko.observable(true);
                        } else {
                            status.visible = ko.observable(false);
                        }
                        _.defer(_insertIntoList, status);
                    }
                },

                _startStreaming = function () {
                    if (_requestsId.length === 0) {
                        _requestsId.push(srcDataservice.beginFilterStreamUpdates(_filterModel, _onReceivedFromStream));
                    }
                },

                _stopStreaming = function () {
                    _.each(_requestsId, function (reqId) {
                        srcDataservice.disposeRequest(reqId);
                    });
                    _requestsId.length = 0;
                };

            this.requestMorePrevious = function () {
                if (!_filterModel) {
                    return;
                }
                var maxId = _.min(_statusesArray,function (oneStatus) {
                    return oneStatus.id_str;
                }).id_str;
                //maxId = maxId - 1;
                _requestsId.push(srcDataservice.requestSearchRestApi(_filterModel, _onReceivedFromRest, maxId - 1));
            };

            this.filter = function (newFilterModel) {
                if (!newFilterModel) {
                    return _filterModel;
                }
                if (newFilterModel instanceof models.ModelSelectedLocation) {
                    self.stopStreaming();
                    _filterModel = newFilterModel;
                    _resetList();
                    srcDataservice.requestSearchRestApi(_filterModel, _onReceivedFromRest);
                    self.startStreaming();
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
            };
            this.setStreamedTweetsVisible = ko.observable(false);
        };

        return {
            StatusesSet: StatusesSet
        };
    }
);