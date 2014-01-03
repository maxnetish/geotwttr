/**
 * Created by max on 03.01.14.
 */

define(["underscore"],
    function (_) {
        var ModelRequest = function (requestOptions) {
            this.requestId = _.uniqueId('wsrequest_');
            this.requestUrl = requestOptions.requestUrl;
            this.requestMethod = requestOptions.requestMethod;
            this.requestParams = requestOptions.requestParams;
            this.requestStream = requestOptions.requestStream;
            this.onResponse = requestOptions.onRespone;
            this.onClose = requestOptions.onClose;
        };

        var socketUrl = "ws://" + window.location.host;
        var requests = {};
        var webSocketConnection;

        var getSocketConnection = function (callback) {
            
        };

        var openRequest = function (options) {
            if (!options) {
                return;
            }
            if (!_.isString(options.requestUrl)) {
                throw "requestUrl required";
            }
            options.requestMethod = options.requestMethod || "GET";
            if (options.requestMethod !== "GET" && options.requestMethod !== "POST") {
                throw "requestMethod must be GET or POST";
            }
            options.requestParams = options.requestParams || {};
            options.requestStream = !!options.requestStream;
            options.onResponse = options.onResponse || function () {
            };
            options.onClose = options.onClose || function () {
            };

            var newRequest = new ModelRequest(options);
            requests[newRequest.requestId] = newRequest;

            return newRequest.requestId;
            /*
             requestUrl: "https://api.twitter.com/1.1/search/tweets.json",
             requestMethod: "GET",
             requestParams: {
             geocode: center.lat() + ',' + center.lng() + ',' + radius + 'km',
             result_type: 'recent', //'mixed', 'popular' or 'recent'
             max_id: maxId
             },
             requestStream: false,
             requestClose: false,
             requestId: "previous"
             */
        };

    });