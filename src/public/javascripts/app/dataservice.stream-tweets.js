/**
 * Created by max on 04.01.14.
 */

define(["dataservice", "underscore", "models"],
    function (dataservice, _, models) {
        var beginFilterStreamUpdates = function (filterModel, callback) {
                var requestOptions;
                if (filterModel instanceof models.ModelSelection) {
                    requestOptions = {
                        requestUrl: "https://stream.twitter.com/1.1/statuses/filter.json",
                        requestMethod: "GET",
                        requestParams: {
                            locations: filterModel.getTwitterLocationsString(),
                            stall_warnings: "true"
                        },
                        requestStream: true,
                        onResponse: callback
                    };
                } else {
                    throw "unknown filter model";
                }
                //return requestId
                return dataservice.openRequest(requestOptions);
            },
            requestSearchRestApi = function (searchModel, callback, maxId, minId) {
                var requestOptions;
                if (searchModel instanceof models.ModelSelection) {
                    requestOptions = {
                        requestUrl: "https://api.twitter.com/1.1/search/tweets.json",
                        requestMethod: "GET",
                        requestParams: {
                            geocode: searchModel.getTwitterGeocodeString(),
                            max_id: maxId,
                            since_id: minId,
                            count: 100,
                            result_type: 'recent' //'mixed', 'popular' or 'recent'
                        },
                        requestStream: false,
                        onResponse: callback
                    };
                } else {
                    throw "unknown search model";
                }
                // return requestId
                return dataservice.openRequest(requestOptions);
            },
            requestPlaceDetails = function (url, callback) {
                var requestOptions = {
                    requestUrl: url,
                    requestMethod: "GET",
                    requestStream: false,
                    onResponse: callback
                };
                return dataservice.openRequest(requestOptions);
            }
        disposeRequest = function (requestId) {
            dataservice.closeRequest(requestId);
        };
        return{
            beginFilterStreamUpdates: beginFilterStreamUpdates,
            requestSearchRestApi: requestSearchRestApi,
            requestPlaceDetails: requestPlaceDetails,
            disposeRequest: disposeRequest
        };
    });