/**
 * Created by mgordeev on 14.11.13.
 */
var express = require('express');
var twitterHelper = require('../helpers/twitter').twitter;
var WebSocket = require("ws");
var _ = require("underscore");

exports.webSocketServer = function (ws) {
    console.log("Websocket connection receive");
    express.cookieParser('A12-dmcd=Asd365%bjldkloed(uhn')(ws.upgradeReq, null, function () {
    });
    var streamRequests = {};
    var accessToken = ws.upgradeReq.signedCookies.at;
    //var twitterStreamRequest;

    var onReject = function () {
        ws.send(JSON.stringify({meta: {code: 400, error_message: "Unauthorized"}}), function (error) {
            ws.terminate();
        });
    };

    twitterHelper.isAccessTokenValid(accessToken, function (error, accountInfo) {

        console.log("Access token checked...");

        if (error) {
            console.log("Reject websocket");
            onReject();
            return;
        }

        console.log("Set event listener");

        ws.on('message', function (message) {
            var clientMessage;
            console.log('received on WS: len='+message.length);
            var sanitizeClientMessage = function (mess) {
                var result = {};
                result.requestUrl = _.isString(mess.requestUrl) ? mess.requestUrl : null;
                result.requestMethod = _.indexOf(["GET", "POST"], mess.requestMethod) !== -1 ? mess.requestMethod : null;
                result.requestParams = _.isObject(mess.requestParams) ? mess.requestParams : null;
                result.requestStream = _.isBoolean(mess.requestStream) ? mess.requestStream : false;
                result.requestId = (_.isString(mess.requestId) || _.isFinite(mess.requestId)) ? mess.requestId : _.uniqueId();
                result.requestClose = _.isBoolean(mess.requestClose) ? mess.requestClose : false;
                return result;
            };

            try {
                clientMessage = JSON.parse(message);
                clientMessage = sanitizeClientMessage(clientMessage);
            }
            catch (error) {
                ws.send(JSON.stringify(error));
                return;
            }

            if (clientMessage.requestClose && clientMessage.requestId) {
                streamRequests[clientMessage.requestId].end();
                streamRequests[clientMessage.requestId] = undefined;
                return;
            }

            clientMessage.accessToken = accessToken;

            var newRequest = new twitterHelper.proxyRequest(clientMessage);
            if (clientMessage.requestStream) {
                streamRequests[clientMessage.requestId] = newRequest;
            }
            newRequest.on("tweetReceived", function (oneTweet) {
                console.log("Send tweet to client");
                ws.send(JSON.stringify(oneTweet));
            });
            newRequest.on("closeConnection", function () {
                ws.send(JSON.stringify({
                    meta: {
                        code: 400,
                        error_message: "Stream closed"
                    }
                }), function (error) {
                    //ws.terminate();
                });
            });
            newRequest.on("requestError", function (error, data) {
                ws.send(JSON.stringify({
                    meta: {
                        error: error
                    },
                    data: data
                }));
            });
        });
        ws.on('close', function () {
            console.log('disconnected');
            _.each(streamRequests, function (oneRequest) {
                oneRequest.end();
            });
        });
    });

    /*
     ws.on('message', function (message) {
     console.log('received: %s', message);
     ws.send("i receieve '" + message + "'");
     });

     var accessToken = req.signedCookies.at;
     var searchOptions = req.query;

     var wsServer = new WebSocket.Server({port: 3001});

     wsServer.on('connection', function(ws) {
     ws.on('message', function(message) {
     console.log('received: %s', message);
     });
     ws.send('something');
     });
     */
};