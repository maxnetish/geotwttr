var TwitterStream = require('./../twitter/stream');
var _ = require('lodash');
var logger = require('../../helpers/logger');

var streams = [];

function onStreamResolve(socket, remote, stream, notify) {
    return function (e) {
        if (socket && socket.readyState === socket.OPEN) {
            remote.invoke(notify, {closed: 1, id: stream.id});
        }
        stream.dispose();
        _.remove(streams, function (item) {
            return item === stream;
        });
        return e;
    };
}

function onStreamError(socket, remote, stream, notify) {
    return function (err) {
        logger.error(err);
        if (socket && socket.readyState === socket.OPEN) {
            remote.invoke(notify, {error: err.message, id: stream.id});
        } else {
            stream.dispose();
            _.remove(streams, function (item) {
                return item === stream;
            });
        }
        return err;
    };
}

function onStreamProgress(socket, remote, stream, notify) {
    return function (tweet) {
        logger.message.response(socket.upgradeReq.user.id_str, tweet);
        if (socket && socket.readyState === socket.OPEN) {
            remote.invoke(notify, {tweet: tweet, id: stream.id});
        } else {
            stream.dispose();
            _.remove(streams, function (item) {
                return item === stream;
            });
        }
        return tweet;
    };
}

/**
 *
 * @param socket
 * @param remote
 * @param opts: {notify, reqMethod, reqUrl, reqData}
 */
var subscribe = function (socket, remote, opts) {
    logger.message.request(socket.upgradeReq.user.id_str, opts);

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