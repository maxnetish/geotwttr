/**
 * Created by max on 02.01.14.
 */
define(["ko", "jquery", "moment"],
    function (ko, $, moment) {
        (function () {
            //configure moment:
            if (window.langCode) {
                moment.lang(window.langCode);
            }

            ko.bindingHandlers.tweetDate = {
                init: function (element, valueAccessor) {
                    var $element = $(element),
                        tweet = valueAccessor(),
                        momentCreated = tweet.createdAtMoment,
                        momentNow = moment(),
                        diffDays = momentCreated.diff(momentNow, "days"),
                        dateFormat,
                        setElementText = function () {
                            $element.html(momentCreated.format(dateFormat));
                        },
                        init = function () {
                            if (diffDays === 0) {
                                dateFormat = "LT";
                            } else {
                                dateFormat = "lll";
                            }
                        };

                    init();
                    setElementText();
                }
            };

            ko.bindingHandlers.renderTweetTextContent = {
                init: function (element, valueAccessor) {
                    var unionEntities = function (tweet, props) {
                            var result = [],
                                currentEntityTypeArray,
                                i, iLen;
                            for (i = 0, iLen = props.length; i < iLen; i++) {
                                currentEntityTypeArray = tweet.entities[props[i]];
                                if (currentEntityTypeArray && currentEntityTypeArray.length) {
                                    $.merge(result, $.map(currentEntityTypeArray, function (entity) {
                                        entity.type_of_entity = props[i];
                                        return entity;
                                    }));
                                }
                            }
                            return result;
                        },
                        renderEntity = function (entity) {
                            var result;
                            if (entity.type_of_entity === "urls") {
                                result = "<a target='_blank' class='entity url' href='" + entity.expanded_url + "'>" + entity.display_url + "</a>";
                            } else if (entity.type_of_entity === "user_mentions") {
                                result = "<a target='_blank' class='entity user-mention' href='https://twitter.com/" + entity.screen_name + "'>" + entity.screen_name + "</a>";
                            } else if (entity.type_of_entity === "hashtags") {
                                result = "<span class='entity hashtag'>" + entity.text + "</span>";
                            } else if (entity.type_of_entity === "symbols") {
                                result = "<span class='entity symbol'>" + entity.text + "</span>";
                            } else if (entity.type_of_entity === "media") {
                                result = "<a target='_blank' class='entity media' href='" + entity.expanded_url + "'>" + entity.display_url + "</a>";
                            } else {
                                result = "<span class='entity'>" + entity.text + "</span>";
                            }
                            return result;
                        },
                        $element = $(element),
                        tweet = valueAccessor(),
                        isRetweet = tweet.isRetweet,
                        initialText = isRetweet ? tweet.retweeted_status.text : tweet.text,
                        initialLen = initialText.length,
                        resultArray = [],
                        remainText = initialText,
                        allEntities = unionEntities(isRetweet ? tweet.retweeted_status : tweet, ["media", "urls", "user_mentions", "hashtags", "symbols"]),
                        origStart,
                        origEnd,
                        generateAndSetHtml = function () {
                            allEntities.sort(function (a, b) {
                                return a.indices[0] - b.indices[0];
                            });
                            $.each(allEntities, function (ind, entity) {
                                origStart = entity.indices[0];
                                origEnd = entity.indices[1];
                                resultArray.push(remainText.substr(0, origStart - (initialLen - remainText.length)));
                                resultArray.push(renderEntity(entity));
                                remainText = remainText.substr(origEnd - (initialLen - remainText.length));
                            });
                            resultArray.push(remainText);
                            $element.html(resultArray.join(""));
                        };
                    generateAndSetHtml();
                }
            };
        })();
    });
