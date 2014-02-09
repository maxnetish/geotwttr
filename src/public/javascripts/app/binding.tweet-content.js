/**
 * Created by max on 02.01.14.
 */
define(["ko", "jquery", "moment", "underscore"],
    function (ko, $, moment, _) {
        (function () {
            var entityTypes = {
                    MEDIA: "media",
                    URLS: "urls",
                    USER_MENTIONS: "user_mentions",
                    HASHTAGS: "hashtags",
                    SYMBOLS: "symbols"
                },
                tweetTextRenderer = {
                    generateAndAppendTweetContent: function ($container, tweet) {
                        var unionEntities = function (t) {
                                var result = [],
                                    currentEntityTypeArray,
                                    prop,
                                    mapEntity = function (entity) {
                                        entity.type_of_entity = entityTypes[prop];
                                        return entity;
                                    };
                                for (prop in entityTypes) {
                                    if (entityTypes.hasOwnProperty(prop)) {
                                        currentEntityTypeArray = t.entities[entityTypes[prop]];
                                        if (currentEntityTypeArray && currentEntityTypeArray.length) {
                                            result = result.concat(_.map(currentEntityTypeArray, mapEntity));
                                            //$.merge(result, _.map(currentEntityTypeArray, mapEntity, entityTypes[prop]));
                                        }
                                    }
                                }
                                return result;
                            },
                            renderPlainText = function (text) {
                                var res = $("<span>", {
                                    "class": "plain"
                                })
                                    .html(text);
                                return res;
                            },
                            renderEntity = function (entity) {
                                var result,
                                    renderUrl = function (e) {
                                        var res = $("<a>", {
                                            target: "_blank",
                                            "class": "entity url notoggle",
                                            href: e.expanded_url
                                        })
                                            .html(e.display_url);
                                        return res;
                                    },
                                    renderUserMention = function (e) {
                                        var res = $("<a>", {
                                            target: "_blank",
                                            "class": "entity user-mention notoggle",
                                            href: "https://twitter.com/" + e.screen_name
                                        })
                                            .html(e.screen_name);
                                        return res;
                                    },
                                    renderHashtag = function (e) {
                                        var res = $("<span>", {
                                            "class": "entity hashtag notoggle"
                                        })
                                            .html(e.text);
                                        return res;
                                    },
                                    renderSymbol = function (e) {
                                        var res = $("<span>", {
                                            "class": "entity symbol notoggle"
                                        })
                                            .html(e.text);
                                        return res;
                                    },
                                    renderMedia = function (e) {
                                        var res = $("<a>", {
                                            target: "_blank",
                                            "class": "entity url notoggle",
                                            href: e.expanded_url
                                        })
                                            .html(e.display_url);
                                        return res;
                                    },
                                    renderDefault = function (e) {
                                        var res = $("<span>", {
                                            "class": "entity notoggle"
                                        })
                                            .html(e.text);
                                        return res;
                                    };
                                switch (entity.type_of_entity) {
                                    case entityTypes.URLS:
                                        result = renderUrl(entity);
                                        break;
                                    case entityTypes.USER_MENTIONS:
                                        result = renderUserMention(entity);
                                        break;
                                    case entityTypes.HASHTAGS:
                                        result = renderHashtag(entity);
                                        break;
                                    case entityTypes.MEDIA:
                                        result = renderMedia(entity);
                                        break;
                                    case entityTypes.SYMBOLS:
                                        result = renderSymbol(entity);
                                        break;
                                    default:
                                        result = renderDefault(entity);
                                        break;
                                }
                                return result;
                            },
                            isRetweet = tweet.isRetweet,
                            allEntities = unionEntities(isRetweet ? tweet.retweeted_status : tweet),
                            initialText = isRetweet ? tweet.retweeted_status.text : tweet.text,
                            initialLen = initialText.length,
                            remainText = initialText,
                            $resultElements = $(),
                            origStart, origEnd, plainTextPreEntityLen;

                        allEntities.sort(function (a, b) {
                            return a.indices[0] - b.indices[0];
                        });
                        $.each(allEntities, function (ind, entity) {
                            origStart = entity.indices[0];
                            origEnd = entity.indices[1];
                            plainTextPreEntityLen = origStart - (initialLen - remainText.length);
                            if (plainTextPreEntityLen) {
                                $resultElements = $resultElements.add(renderPlainText(remainText.substr(0, plainTextPreEntityLen)));
                            }
                            $resultElements = $resultElements.add(renderEntity(entity));
                            remainText = remainText.substr(origEnd - (initialLen - remainText.length));
                        });
                        if (remainText.length) {
                            $resultElements = $resultElements.add(renderPlainText(remainText));
                        }
                        $container.append($resultElements);
                    },
                    formatAndSetDate: function ($element, tweet) {
                        var momentCreated = tweet.createdAtMoment,
                            momentNow = moment(),
                            diffDays = momentCreated.diff(momentNow, "days"),
                            dateFormat;

                        if (diffDays === 0) {
                            dateFormat = "LT";
                        } else {
                            dateFormat = "lll";
                        }
                        $element.html(momentCreated.format(dateFormat));
                    }
                };

            //configure moment:
            if (window.langCode) {
                moment.lang(window.langCode);
            }

            ko.bindingHandlers.tweetDate = {
                init: function (element, valueAccessor) {
                    var $element = $(element),
                        tweet = valueAccessor();
                    tweetTextRenderer.formatAndSetDate($element, tweet);
                }
            };

            ko.bindingHandlers.renderTweetTextContent = {
                init: function (element, valueAccessor) {
                    var $element = $(element),
                        tweet = valueAccessor();
                    tweetTextRenderer.generateAndAppendTweetContent($element, tweet);
                }
            };
        })();
    });
