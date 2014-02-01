/**
 * Created by Gordeev on 01.02.14.
 */

define(["config"],
    function (config) {
        var severity = {
                INFO: "INFO",
                ERROR: "ERROR",
                CRITICAL: "CRITICAL"
            },

            consoleLog = function (message, level, source) {
                message = message || "";
                level = level || severity.INFO;
                source = source || "APP";
                console.log("[" + source + "] " + level + ": " + message);
            },

            nodebugLog = function (message, level, source) {
                //nothing yet
            },

            debugDir = function (value) {
                console.dir(value);
            },

            nodebugDir = function (value) {
                //nothing yet
            };

        return{
            severity: severity,
            log: (config.debug && console && console.log) ? consoleLog : nodebugLog,
            dir: (config.debug && console && console.dir) ? debugDir : nodebugDir
        };
    }
);