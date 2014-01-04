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
            this.onResponse = requestOptions.onResponse;
        };
        ModelRequest.prototype.messageToSend = function (closeRequest) {
            return JSON.stringify({
                requestUrl: this.requestUrl,
                requestMethod: this.requestMethod,
                requestParams: this.requestParams,
                requestStream: this.requestStream,
                requestClose: !!closeRequest,
                requestId: this.requestId
            });
        };

        var socketUrl = "ws://" + window.location.host;
        var requests = {};
        var webSocketConnection;
        var socketOpenListeners = [];

        var initAndBindConnection = function () {
            socketOpenListeners.length = 0;
            webSocketConnection = new WebSocket(socketUrl);
            webSocketConnection.onmessage = function (event) {
                var incomingMessage = JSON.parse(event.data);
                var requestId = incomingMessage.requestId;
                if (requests[requestId]) {
                    requests[requestId].onResponse(incomingMessage);
                }
            };
            webSocketConnection.onerror = function (event) {
                console.log("socket error");
                console.dir(event);
            };
            webSocketConnection.onclose = function (event) {
                console.log("socket closed, reopen...");
                getSocketConnection(function (socketConnection) {
                    _.each(requests, function (oneRequest) {
                        socketConnection.send(oneRequest.messageToSend(false));
                    });
                });
            };
            webSocketConnection.onopen = function (event) {
                console.log("socket open, notify subscribers...");
                _.each(socketOpenListeners, function (listener) {
                    if (_.isFunction(listener)) {
                        listener(event);
                    }
                })
            }
        };

        var getSocketConnection = function (callback) {
            if (!webSocketConnection) {
                initAndBindConnection();
            }
            switch (webSocketConnection.readyState) {
                case webSocketConnection.OPEN:       // 1
                    callback(webSocketConnection);
                    break;
                case webSocketConnection.CONNECTING: // 0
                    console.log("[DATA] socket state is CONNECTING, wait onopen");
                    socketOpenListeners.push(function (event) {
                        setTimeout(function () {
                            callback(webSocketConnection);
                        }, 1000);
                    });
                    break;
                case webSocketConnection.CLOSING:    // 3
                case webSocketConnection.CLOSED:     // 2
                    initAndBindConnection();
                    socketOpenListeners.push(function (event) {
                        setTimeout(function () {
                            callback(webSocketConnection);
                        }, 1000);
                    });
                    break;
                default:
                    console.log("Socket unknown state");
                    callback(null);
                    break;
            }
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

            var newRequest = new ModelRequest(options);

            requests[newRequest.requestId] = newRequest;
            console.log("[DATA] wait for socket ready...")
            console.dir(newRequest);
            getSocketConnection(function (socketConnection) {
                console.log("[DATA] sending to socket...");
                console.dir(newRequest);
                socketConnection.send(newRequest.messageToSend(false));
            });

            return newRequest.requestId;
        };

        var closeRequest = function (requestId) {
            if (requests[requestId]) {
                getSocketConnection(function (socketConnection) {
                    socketConnection.send(requests[requestId].messageToSend(true));
                    delete requests[requestId];
                });
            }
        };

        return{
            openRequest: openRequest,
            closeRequest: closeRequest
        };
    });