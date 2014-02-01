/**
 * Created by max on 03.01.14.
 */

define(["underscore", "logger"],
    function (_, logger) {
        var ModelRequest = function (requestOptions) {
                this.requestId = _.uniqueId('wsrequest_');
                this.requestUrl = requestOptions.requestUrl;
                this.requestMethod = requestOptions.requestMethod;
                this.requestParams = requestOptions.requestParams;
                this.requestStream = requestOptions.requestStream;
                this.onResponse = requestOptions.onResponse;
            },

            socketUrl = "ws://" + window.location.host,
            requests = {},
            webSocketConnection,
            socketOpenListeners = [],
            moduleName = "DATASERVICE",

            initAndBindConnection = function () {
                socketOpenListeners.length = 0;
                webSocketConnection = new window.WebSocket(socketUrl);
                webSocketConnection.onmessage = function (event) {
                    var incomingMessage = JSON.parse(event.data),
                        requestId = incomingMessage.requestId;
                    if (requests[requestId]) {
                        requests[requestId].onResponse(incomingMessage);
                    }
                };
                webSocketConnection.onerror = function (event) {
                    logger.log("socket error", logger.severity.ERROR, moduleName);
                    logger.dir(event);
                };

                webSocketConnection.onclose = function () {
                    logger.log("socket closed", logger.severity.INFO, moduleName);
                    // FIXME это неправильно - иногда могуь открыться два и более сокетов и со всех данные приходят
                    getSocketConnection(function (socketConnection) {
                        _.each(requests, function (oneRequest) {
                            var messageToSend = oneRequest.messageToSend(false);
                            socketConnection.send(messageToSend);
                        });
                    });

                };
                webSocketConnection.onopen = function (event) {
                    logger.log("socket open, notify subscribers...", logger.severity.INFO, moduleName);
                    _.each(socketOpenListeners, function (listener) {
                        if (_.isFunction(listener)) {
                            listener(event);
                        }
                    });
                };
            },

            getSocketConnection = function (callback) {
                if (!webSocketConnection) {
                    initAndBindConnection();
                }
                switch (webSocketConnection.readyState) {
                    case webSocketConnection.OPEN:       // 1
                        callback(webSocketConnection);
                        break;
                    case webSocketConnection.CONNECTING: // 0
                        logger.log("socket state is CONNECTING, wait for open", logger.severity.INFO, moduleName);
                        socketOpenListeners.push(function () {
                            setTimeout(function () {
                                callback(webSocketConnection);
                            }, 1000);
                        });
                        break;
                    case webSocketConnection.CLOSING:    // 3
                    case webSocketConnection.CLOSED:     // 2
                        initAndBindConnection();
                        socketOpenListeners.push(function () {
                            setTimeout(function () {
                                callback(webSocketConnection);
                            }, 1000);
                        });
                        break;
                    default:
                        logger.log("Socket unknown state", logger.severity.ERROR, moduleName);
                        callback(null);
                        break;
                }
            },

            openRequest = function (options) {
                var newRequest;
                if (!options) {
                    return null;
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

                newRequest = new ModelRequest(options);

                requests[newRequest.requestId] = newRequest;
                logger.log("wait for socket ready...", logger.severity.INFO, moduleName);
                logger.dir(newRequest);
                getSocketConnection(function (socketConnection) {
                    var messageToSend;
                    logger.log("sending to socket...", logger.severity.INFO, moduleName);
                    logger.dir(newRequest);
                    messageToSend = newRequest.messageToSend(false);
                    socketConnection.send(messageToSend);
                });

                return newRequest.requestId;
            },

            closeRequest = function (requestId) {
                if (requests[requestId]) {
                    getSocketConnection(function (socketConnection) {
                        var messageToSend = requests[requestId].messageToSend(true);
                        socketConnection.send(messageToSend);
                        delete requests[requestId];
                    });
                }
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

        return{
            openRequest: openRequest,
            closeRequest: closeRequest
        };
    });