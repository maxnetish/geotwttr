/**
 * Created by max on 05.01.14.
 */
define(["ko", "underscore", "models"],
    function (ko, _, models) {
        var statusesSet = function (srcDataservice) {
            var self = this;
            var _statusesList = ko.observableArray();
            var _statusesListUnwrapped = _statusesList();
            var _filterModel;
            var _requestsId = [];

            var _insertIntoList = function (statusToInsert) {
                var indexToInsert = _.sortedIndex(_statusesListUnwrapped, statusToInsert, function (oneStatus) {
                    return -oneStatus.id;
                });

                statusToInsert.isRetweet = !!statusToInsert.retweeted_status;
                statusToInsert.canShowOnMap = !!statusToInsert.coordinates;

                _statusesList.splice(indexToInsert, 0, statusToInsert);

                var visible = _.isFunction(statusToInsert.visible) ? !!statusToInsert.visible() : true;
                if (visible) {
                    self.visibleStatusesCount(self.visibleStatusesCount() + 1);
                } else {
                    self.hidedStatusesCount(self.hidedStatusesCount() + 1);
                }
            };

            var _extractStatus = function (message) {
                if (message && message.tweet) {
                    return message.tweet;
                } else {
                    return null;
                }
            }

            var _preprocessStreamResponse = function (message) {
                if (message.disconnect) {
                    _.each(_requestsId, function (reqId) {
                        srcDataservice.disposeRequest(reqId);
                    });
                    _requestsId.length = 0;
                }
            };

            var _resetList = function () {
                _.each(_requestsId, function (reqId) {
                    srcDataservice.disposeRequest(reqId);
                });
                _requestsId.length = 0;
                _statusesList.removeAll();
                self.hidedStatusesCount(0);
                self.visibleStatusesCount(0);
            }

            var _onReceivedFromRest = function (message) {
                var status = _extractStatus(message);
                if (status && status.id) {
                    status.visible = ko.observable(true);
                    _.defer(_insertIntoList, status);
                }
            };

            var _onReceivedFromStream = function (message) {
                _preprocessStreamResponse(message);
                var status = _extractStatus(message);
                if (status && status.id) {
                    status.visible = ko.observable(false);
                    _.defer(_insertIntoList, status);
                }
            };

            var _startStreaming = function () {
                if (_requestsId.length === 0) {
                    _requestsId.push(srcDataservice.beginFilterStreamUpdates(_filterModel, _onReceivedFromStream));
                }
            };

            var _stopStreaming = function () {
                _.each(_requestsId, function (reqId) {
                    srcDataservice.disposeRequest(reqId);
                });
                _requestsId.length = 0;
            }

            this.requestMorePrevious = function () {
                if (!_filterModel) {
                    return;
                }
                var maxId = _.min(_statusesListUnwrapped,function (oneStatus) {
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
                    _filterModel = newFilterModel;
                    _resetList();
                    srcDataservice.requestSearchRestApi(_filterModel, _onReceivedFromRest);
                    return _filterModel;
                } else {
                    throw "Unknown filter model";
                }
            };
            this.startStreaming = _startStreaming;
            this.stopStreaming = _stopStreaming;
            this.statusesList = _statusesList;
            this.visibleStatusesCount = ko.observable(0);
            this.hidedStatusesCount = ko.observable(0);
            this.makeAllVisible = function () {
                _.each(_statusesListUnwrapped, function (oneStatus) {
                    if (_.isFunction(oneStatus.visible)) {
                        if (!oneStatus.visible()) {
                            oneStatus.visible(true);
                            self.hidedStatusesCount(self.hidedStatusesCount() - 1);
                            self.visibleStatusesCount(self.visibleStatusesCount() + 1);
                        }
                    }
                });
            };
        };

        return statusesSet;
    });