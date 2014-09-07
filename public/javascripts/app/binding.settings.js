/**
 * Created by Gordeev on 18.05.2014.
 */
define(["ko", "jquery", "underscore"],
    function (ko, $, _) {
        (function () {
            ko.bindingHandlers.toggleSettingsPanel = {
                init: function (element) {
                    var $button = $(element),
                        settingsPanel = $button.siblings(".settings-wrapper"),

                        togglePanel = function () {
                            if (settingsPanel.is(":visible")) {
                                settingsPanel.css("opacity", "");
                                _.delay(function () {
                                    settingsPanel.css("display", "");
                                }, 500);
                            } else {
                                settingsPanel.css("display", "block");
                                _.defer(function () {
                                    settingsPanel.css("opacity", 1);
                                })
                            }
                        };

                    $button.on("click", togglePanel);
                }
            }
        })();
    });