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
                            allEntities = unionEntities(tweet),
                            initialText = tweet.text,
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
                            //remainText = remainText.substr(origEnd - (initialLen - remainText.length));
                            remainText = initialText.substr(origEnd);
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
                },
                body=$("body").get(0),
                isElementInViewport = function ($element, fullVisible) {
                    var $window = $(window),
                        viewport = {
                            top: $window.scrollTop(),
                            left: $window.scrollLeft()
                        },
                        bounds;

                    if (!$element.is(":visible")) {
                        return false;
                    }else{
                        console.log("[LAZY] $element visible!")
                    }

                    viewport.right = viewport.left + $window.width();
                    viewport.bottom = viewport.top + $window.height();

                    bounds = $element.offset();
                    bounds.right = bounds.left + $element.outerWidth();
                    bounds.bottom = bounds.top + $element.outerHeight();

                    if (fullVisible) {
                        return viewport.top <= bounds.top
                            && viewport.right >= bounds.right
                            && viewport.left <= bounds.left
                            && viewport.bottom >= bounds.bottom;
                    }
                    return (!(viewport.right < bounds.left
                        || viewport.left > bounds.right
                        || viewport.bottom < bounds.top
                        || viewport.top > bounds.bottom));
                },
                tweetClickHandler = function (event) {
                    var $target = $(event.target);
                    if (!$target.is(".notoggle") && $target.parentsUntil(".li-tweet", ".notoggle").length === 0) {
                        if (_.isFunction(this.details)) {
                            this.details(!this.details());
                            event.preventDefault();
                        }
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

            ko.bindingHandlers.lazyLoadingImage = {
                init: function (element, valueAccessor) {
                    var $element = $(element),
                        options = valueAccessor(),
                        $scrollContainer = $(options.container),
                        eventId = _.uniqueId(".scroll_"),
                        srcSubscribeHandler,
                        checkVisibilityHandler,
                        prepareElement = function () {
                            $element.addClass("hided");
                        },
                        setImgSrc = function () {
                            $element.one("load error", function () {
                                $element.removeClass("hided");
                            });
                            $element.attr("src", ko.utils.unwrapObservable(options.src));
                        },
                        waitForBecomeVisible = function () {
                            var checkVisibility = function () {
                                if(!body.contains($element.get(0))){
                                    $scrollContainer.off(eventId);
                                    $(window).off(eventId);
                                    if (checkVisibilityHandler) {
                                        checkVisibilityHandler.dispose();
                                        checkVisibilityHandler = null;
                                    }
                                    return false;
                                }
                                if (isElementInViewport($element, true)) {
                                    $scrollContainer.off(eventId);
                                    $(window).off(eventId);
                                    if (checkVisibilityHandler) {
                                        checkVisibilityHandler.dispose();
                                        checkVisibilityHandler = null;
                                    }
                                    setImgSrc();
                                    return true;
                                }

                                return false;
                            };
                            if (!checkVisibility()) {
                                $scrollContainer.on("scroll" + eventId, _.debounce(checkVisibility, 500));
                                $(window).on("resize" + eventId, _.debounce(checkVisibility, 500));
                                if (ko.isObservable(options.checkVisibility)) {
                                    checkVisibilityHandler = options.checkVisibility.subscribe(checkVisibility);
                                }
                            }
                        };
                    if (!options.src) {
                        return;
                    }
                    prepareElement();
                    if (ko.isObservable(options.src)) {
                        if (options.src()) {
                            waitForBecomeVisible();
                        } else {
                            srcSubscribeHandler = options.src.subscribe(function (srcUnwrapped) {
                                if (srcUnwrapped) {
                                    waitForBecomeVisible();
                                    srcSubscribeHandler.dispose();
                                }
                            });
                        }
                    } else if (options.src) {
                        _.defer(waitForBecomeVisible);
                    }
                }
            };
            ko.bindingHandlers.tweetCustomEvents = {
                init: function (element, valueAccessor) {
                    var $element = $(element),
                        data = valueAccessor();

                    $element.on("click", function (event) {
                        tweetClickHandler.call(data, event);
                    });
                }
            };
        })();
    });
