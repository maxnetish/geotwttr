/**
 * Created by Gordeev on 15.03.14.
 */
define(["jquery", "underscore"],
    function ($, _) {

        var onYouTubeIframeAPIReadyCallbacks = [];

        var onYouTubeIframeAPIReadyInternal = function () {
            _.each(onYouTubeIframeAPIReadyCallbacks, function (callback) {
                if (_.isFunction(callback)) {
                    callback();
                }
            });
        };

        var init = function () {
            window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReadyInternal;
        };

        var initBeforeCreateInstance = function (callback) {
            if (_.isUndefined(window.YT) || _.isUndefined(window.YT.Player)) {
                onYouTubeIframeAPIReadyCallbacks.push(callback);
                $.getScript('//www.youtube.com/iframe_api');
            } else {
                if (_.isFunction(callback)) {
                    callback();
                }
            }
        };

        var createPlayerInstance = function (containerId, options, callback) {
            initBeforeCreateInstance(function () {
                var instance = new YT.Player(containerId, options);
                callback(instance);
            });
            /*
             {
             videoId: videoId,
             width: 356,
             height: 200,
             playerVars: {
             autohide: 2,
             autoplay: 0,
             controls: 1,
             modestbranding: 1,
             rel: 0,
             showInfo: 0
             }
             */
        };

        init();

        return{
            createPlayerInstance: createPlayerInstance
        }
    });