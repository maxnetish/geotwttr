/**
 * Created by max on 03.01.14.
 */

define(["ko", "gmaps", "underscore"],
    function (ko, gmaps, _) {
        var ModelStatusesList = function (srcDataservice) {
            var self = this;
            var _statusesList = ko.observableArray();
            var _statusesListUnwrapped = _statusesList();
            var _filterModel;
            var _requestsId = [];
            //var _middleBuffer=[];


            //var _bufferAdd=function(status){
            //    var currentMiddleBufferLen =_middleBuffer.push(status);
            //};

            //var _bufferFlush=function(){
            //
            //};

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
                    _insertIntoList(status);
                }
            };

            var _onReceivedFromStream = function (message) {
                var status = _extractStatus(message);
                if (status && status.id) {
                    status.visible = ko.observable(false);
                    _insertIntoList(status);
                }
            };

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
                if (newFilterModel instanceof ModelSelectedLocation) {
                    _filterModel = newFilterModel;
                    _resetList();
                    _requestsId.push(srcDataservice.requestSearchRestApi(_filterModel, _onReceivedFromRest));
                    _requestsId.push(srcDataservice.beginFilterStreamUpdates(_filterModel, _onReceivedFromStream));
                    return _filterModel;
                } else {
                    throw "Unknown filter model";
                }
            };
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

        var ModelSelectedLocation = function (center, radius) {
            center = center || new gmaps.LatLng(45.43, 12.33); //default: Venice
            radius = radius || 5000;

            var self = this,
                _center = ko.observable(center),
                _radius = ko.observable(radius),
                _geoName = ko.observable(""),
                _bounds = ko.computed({
                    read: function () {
                        return self.calcBounds();
                    },
                    deferEvaluation: true
                });

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
            var boundsUnwrapped = this.bounds();
            var SWlatlng = boundsUnwrapped.getSouthWest();
            var NElanlng = boundsUnwrapped.getNorthEast();
            var result = SWlatlng.lng() + "," + SWlatlng.lat() + "," + NElanlng.lng() + "," + NElanlng.lat();
            return result;
        };
        ModelSelectedLocation.prototype.getTwitterGeocodeString = function () {
            var centerUnwrapped = this.center();
            var radiusUnwrapped = this.radius();
            var result = centerUnwrapped.lat() + ',' + centerUnwrapped.lng() + ',' + (radiusUnwrapped / 1000) + 'km';
            return result;
        };

        return{
            ModelSelectedLocation: ModelSelectedLocation,
            ModelStatusesList: ModelStatusesList
        }
    });