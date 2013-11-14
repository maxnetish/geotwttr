/**
 * Created by mgordeev on 14.11.13.
 */
var express = require('express');
var twitterHelper = require('../helpers/twitter').twitter;
var WebSocket = require("ws");

exports.webSocketServer = function (ws) {
    console.log("Websocket connection receive");
    express.cookieParser('A12-dmcd=Asd365%bjldkloed(uhn')(ws.upgradeReq, null, function () {});
    var accessToken = ws.upgradeReq.signedCookies.at;
    var twitterStreamRequest;

    var onReject = function () {
        ws.send(JSON.stringify({meta: {code: 400, error_message: "Unauthorized"}}), function (error) {
            ws.terminate();
        });
    };

    twitterHelper.isAccessTokenValid(accessToken, function (error, accountInfo) {
        if (error) {
            console.log("Reject websocket");
            onReject();
            return;
        }
        ws.on('message', function (message) {
            console.log('received: %s', message);
            if (twitterStreamRequest) {
                twitterStreamRequest.end();
                twitterStreamRequest = null;
            }
            twitterStreamRequest = new twitterHelper.statusesFilterStream({
                accessToken: accessToken,
                filterOptions: JSON.parse(message)
            });
            twitterStreamRequest.on("tweetReceived", function (oneTweet) {
                console.log("Send tweet to client");
                ws.send(oneTweet);
            });
            twitterStreamRequest.on("closeConnection", function () {
                ws.send(JSON.stringify({meta: {code: 400, error_message: "Stream closed"}}), function (error) {
                    //ws.terminate();
                });
            });
            twitterStreamRequest.on("requestError", function (error, data) {
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
            if (twitterStreamRequest) {
                twitterStreamRequest.end();
                twitterStreamRequest = null;
            }
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