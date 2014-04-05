/**
 * Created by Gordeev on 05.04.14.
 */
define(["ko", "underscore", "models"],
    function (ko, _, models) {
        var settings = [],
            init = function () {
                settings.push(new models.ModelSetting({
                    name: "Use stream API",
                    value: true,
                    type: "checkbox",
                    promptOrTitle: null
                }));
                settings.push(new models.ModelSetting({
                    name: "Contains text",
                    value: null,
                    type: "text",
                    promptOrTitle: "Text to search in tweets"
                }));
            };

        init();
        return{
            settings: settings
        }
    });