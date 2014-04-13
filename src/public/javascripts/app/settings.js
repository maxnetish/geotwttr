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
                    type: "search",
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
                            textToSearch = textToSearch.toUpperCase();
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
                settings.containsImages = new models.ModelSetting({
                    name: "Contains images",
                    value: false,
                    type: "checkbox",
                    promptOrTitle: "Show tweets with images",
                    filterCallback: function (tweet, target) {
                        var T = target || this,
                            valueToSearch = !!T.value();
                        if (valueToSearch) {
                            return !!tweet.mediaList.length;
                        } else {
                            return true;
                        }
                    },
                    useForFilter: true,
                    iconClass: ""
                });
                settings.foursquare = new models.ModelSetting({
                    name: "Foursquare checkins",
                    value: false,
                    type: "checkbox",
                    promptOrTitle: "Show tweets with foursqaure checkins",
                    filterCallback: function (tweet, target) {
                        var T = target || this,
                            valueToSearch = !!T.value();
                        if (valueToSearch) {
                            return !!tweet.foursquareCheckinComputed();
                        } else {
                            return true;
                        }
                    },
                    useForFilter: true,
                    iconClass: "icon-foursquare"
                });
                settings.geotagged = new models.ModelSetting({
                    name: "Really geotagged",
                    value: false,
                    type: "checkbox",
                    promptOrTitle: "Show geotagged tweets",
                    filterCallback: function (tweet, target) {
                        var T = target || this,
                            valueToSearch = !!T.value();
                        if (valueToSearch) {
                            return !!tweet.coordinates;
                        } else {
                            return true;
                        }
                    },
                    useForFilter: true,
                    iconClass: "icon-map-marker"
                });
                settings.language = new models.ModelSetting({
                    name: "Specific language",
                    value: "",
                    type: "text",
                    promptOrTitle: "Language of tweet",
                    filterCallback: function (tweet, target) {
                        var T = target || this,
                            langValue,
                            langToSearch;

                        langValue = tweet.lang || "und";
                        langToSearch = T.value();
                        if (langToSearch) {
                            langToSearch = langToSearch.toLowerCase();
                            return langValue === langToSearch;
                        } else {
                            return true;
                        }
                    },
                    useForFilter: true,
                    iconClass: "icon-keyboard-o",
                    suggestList: ["en", "ru", "jp", "it"]
                });
                settings.specificArea = new models.ModelSetting({
                    name: "Really in specified area",
                    value: false,
                    type: "checkbox",
                    promptOrTitle: "Show tweets geotagged in specified area",
                    filterCallback: function (tweet, target) {
                        var T = target || this,
                            valueToSearch = !!T.value();
                        if (valueToSearch) {
                            return !!tweet.isStreactlyInArea;
                        } else {
                            return true;
                        }
                    },
                    useForFilter: true,
                    iconClass: "icon-map-marker"
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