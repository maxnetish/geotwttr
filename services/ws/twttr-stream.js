var TwitterStream = require('./../twitter/stream');
var _ = require('lodash');

var streams = [];

var onStreamResolve = function (socket, remote, stream, notify) {
    return function (e) {
        console.log('resolve stream, socket state: '+socket.readyState);
        if (socket && socket.readyState === socket.OPEN) {
            remote.invoke(notify, {closed: 1});
        }
        stream.dispose();
        _.remove(streams, function (item) {
            return item === stream;
        });
    };
};

var onStreamError = function (socket, remote, stream, notify) {
    return function (err) {
        console.log('error, socket state: '+socket.readyState);
        if (socket && socket.readyState === socket.OPEN) {
            remote.invoke(notify, {error: err.message});
        } else {
            stream.dispose();
            _.remove(streams, function (item) {
                return item === stream;
            });
        }
    };
};

var onStreamProgress = function (socket, remote, stream, notify) {
    return function (tweet) {
        console.log('progress, socket state: '+socket.readyState);
        if (socket && socket.readyState === socket.OPEN) {
            remote.invoke(notify, {tweet: tweet});
        } else {
            stream.dispose();
            _.remove(streams, function (item) {
                return item === stream;
            });
        }
    };
};

/**
 *
 * @param socket
 * @param remote
 * @param opts: {notify, reqMethod, reqUrl, reqData}
 */
var subscribe = function (socket, remote, opts) {
    var stream = new TwitterStream({
        accessToken: socket.upgradeReq.signedCookies.at,
        method: opts.reqMethod,
        url: opts.reqUrl,
        data: opts.reqData
    });

    stream.promise
        .then(onStreamResolve(socket, remote, stream, opts.notify))
        .fail(onStreamError(socket, remote, stream, opts.notify))
        .progress(onStreamProgress(socket, remote, stream, opts.notify));

    streams.push(stream);
    return stream.id;
};

var unsubscribe = function (socket, remote, subscriptionId) {
    var stream = _.remove(streams, function (item) {
            return item.id === subscriptionId;
        }),
        len = stream.length;
    if (len) {
        stream = stream[0];
        stream.dispose();
    }
    return len;
};

module.exports = {
    subscribe: subscribe,
    unsubscribe: unsubscribe
};