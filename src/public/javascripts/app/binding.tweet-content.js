/**
 * Created by max on 02.01.14.
 */
define(["ko", "jquery", "moment"],
    function (ko, $, moment) {
        (function () {
            ko.bindingHandlers.tweetDate = {
                init: function (element, valueAccessor) {
                    var $element = $(element);
                    var tweet = valueAccessor();
                    var created_at = tweet.isRetweet ? tweet.retweeted_status.created_at : tweet.created_at;
                    var momentCreated = moment(created_at);

                    var setElementText = function () {
                        $element.html(momentCreated.fromNow());
                    };
                    var intervalId;


                    setElementText();

                    /*
                    intervalId = setInterval(function () {
                        if (element && document.contains(element)) {
                            console.log("[MAP] update datetime text");
                            setElementText();
                        } else {
                            console.log("[MAP] clear interval datetime update");
                            clearInterval(intervalId);
                        }
                    }, 60000);
                    */
                }
            };

            ko.bindingHandlers.endlessList = {
                init: function (element, valueAccessor) {
                    var $element = $(element);
                    var needMore = valueAccessor();

                    var calcScrollBottom = function () {
                        var scrollTop = $element.scrollTop();
                        var listInnerHeight = 0;
                        $element.children("li:visible").each(function () {
                            listInnerHeight = listInnerHeight + $(this).outerHeight(true);
                        });
                        var listHeight = $element.height();
                        var scrollBottom = listInnerHeight - scrollTop - listHeight;
                        return scrollBottom;
                    };

                    $element.on("scroll", function (event) {
                        var scrollBottom = calcScrollBottom();
                        var $buttonElement;
                        if (scrollBottom === 0 && $(".button-need-more", $element).length === 0) {
                            $buttonElement = $("<div>", {"class": "button-need-more"}).html("Load more...").appendTo($element);
                            setTimeout(function () {
                                $buttonElement.remove();
                                if (calcScrollBottom() === 0) {
                                    needMore();
                                }
                            }, 10000);

                        }
                    });
                }
            };

            ko.bindingHandlers.renderTweetTextContent = {
                init: function (element, valueAccessor) {
                    var unionEntities = function (tweet, props) {
                        var result = [];
                        var currentEntityTypeArray;
                        for (var i = 0; i < props.length; i++) {
                            currentEntityTypeArray = tweet.entities[props[i]];
                            if (currentEntityTypeArray && currentEntityTypeArray.length) {
                                $.merge(result, $.map(currentEntityTypeArray, function (entity) {
                                    entity.type_of_entity = props[i];
                                    return entity;
                                }));
                            }
                        }
                        return result;
                    };
                    var renderEntity = function (entity) {
                        var result;
                        if (entity.type_of_entity == "urls") {
                            return "<a target='_blank' class='entity url' href='" + entity.expanded_url + "'>" + entity.display_url + "</a>";
                        } else if (entity.type_of_entity == "user_mentions") {
                            return "<a target='_blank' class='entity user-mention' href='https://twitter.com/" + entity.screen_name + "'>" + entity.screen_name + "</a>";
                        } else if (entity.type_of_entity == "hashtags") {
                            return "<span class='entity hashtag'>" + entity.text + "</span>";
                        } else if (entity.type_of_entity == "symbols") {
                            return "<span class='entity symbol'>" + entity.text + "</span>";
                        } else if (entity.type_of_entity == "media") {
                            return "<a target='_blank' class='entity media' href='" + entity.expanded_url + "'>" + entity.display_url + "</a>";
                        }
                        else {
                            return "<span class='entity'>" + entity.text + "</span>";
                        }
                    };

                    var $element = $(element);
                    var tweet = valueAccessor();

                    var isRetweet = tweet.isRetweet;
                    var initialText = isRetweet ? tweet.retweeted_status.text : tweet.text;
                    var initialLen = initialText.length;
                    //var tweetEntities=isRetweet?tweet.retweeted_status.entities:tweet.entities;
                    var resultArray = [];
                    var remainText = initialText;

                    var allEntities = unionEntities(isRetweet ? tweet.retweeted_status : tweet, ["media", "urls", "user_mentions", "hashtags", "symbols"]);
                    allEntities.sort(function (a, b) {
                        return a.indices[0] - b.indices[0];
                    });

                    var origStart;
                    var origEnd;
                    $.each(allEntities, function (ind, entity) {
                        origStart = entity.indices[0];
                        origEnd = entity.indices[1];
                        resultArray.push(remainText.substr(0, origStart - (initialLen - remainText.length)));
                        resultArray.push(renderEntity(entity));
                        remainText = remainText.substr(origEnd - (initialLen - remainText.length));
                    });
                    resultArray.push(remainText);
                    $element.html(resultArray.join(""));
                }
            };
        })();
    });
