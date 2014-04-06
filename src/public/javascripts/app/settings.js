/**
 * Created by Gordeev on 05.04.14.
 */
define(["ko", "underscore", "models"],
    function (ko, _, models) {
        var settings = {},
            settingsArray = [],
            init = function () {
                settings.useStreamApi = new models.ModelSetting({
                    name: "Use stream API",
                    value: true,
                    type: "checkbox",
                    promptOrTitle: null
                });
                settings.containsText = new models.ModelSetting({
                    name: "Contains text",
                    value: null,
                    type: "text",
                    promptOrTitle: "Text to search in tweets",
                    filterCallback: function (tweet, target) {
                        var T = target || this,
                            textValue,
                            textToSearch;

                        if (_.isUndefined(tweet.textUpper)) {
                            tweet.textUpper = tweet.text.toUpperCase();
                        }
                        textValue = tweet.textUpper;
                        textToSearch = T.value();
                        if (textToSearch) {
                            textToSearch=textToSearch.toUpperCase();
                            return textValue.contains(textToSearch);
                        } else {
                            return true;
                        }
                    },
                    useForFilter: true,
                    iconClass: "icon-terminal"
                });
                settings.containsYoutube = new models.ModelSetting({
                    name: "Contains youtube media",
                    value: false,
                    type: "checkbox",
                    promptOrTitle: "Show tweets which contains youtube link",
                    filterCallback: function (tweet, target) {
                        var T = target || this,
                            valueToSearch;
                        valueToSearch = !!T.value();
                        if (valueToSearch) {
                            return !!tweet.youtubeVideos;
                        } else {
                            return true;
                        }
                    },
                    useForFilter: true,
                    iconClass: "icon-youtube-play"
                });

                for (prop in settings) {
                    if (settings.hasOwnProperty(prop)) {
                        settingsArray.push(settings[prop]);
                    }
                }
            };

        init();
        return{
            settings: settings,
            settingsArray: settingsArray
        }
    });