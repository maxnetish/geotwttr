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
                isElementInViewport = function ($element, $scroller, fullVisible) {
                    var scrollerBounds, elementBounds;
                    scrollerBounds = $scroller.get(0).getBoundingClientRect();
                    elementBounds = $element.get(0).getBoundingClientRect();
                    if (fullVisible) {
                        return scrollerBounds.top <= elementBounds.top
                            && scrollerBounds.right >= elementBounds.right
                            && scrollerBounds.left <= elementBounds.left
                            && scrollerBounds.bottom >= elementBounds.bottom;
                    }
                    return (!(scrollerBounds.right < elementBounds.left
                        || scrollerBounds.left > elementBounds.right
                        || scrollerBounds.bottom < elementBounds.top
                        || scrollerBounds.top > elementBounds.bottom));
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

            var ImageLoaderWhenScrollInView = function (element, valueAccessor) {
                var self = this;

                this.$element = $(element);
                this.options = valueAccessor();
                this.$scrollContainer = $(this.options.container);
                this.eventId = _.uniqueId(".scroll_");
                this.srcSubscribeHandler;
                this.checkVisibilityHandler;

                if (!this.options.src) {
                    return;
                }

                this.prepareElement();
                if (ko.isObservable(this.options.src)) {
                    if (this.options.src()) {
                        this.waitForBecomeVisible();
                    } else {
                        this.srcSubscribeHandler = this.options.src.subscribe(function (srcUnwrapped) {
                            if (srcUnwrapped) {
                                this.waitForBecomeVisible();
                                this.srcSubscribeHandler.dispose();
                            }
                        }, this);
                    }
                } else if (this.options.src) {
                    _.defer(_.bind(this.waitForBecomeVisible, this));
                }
            };
            ImageLoaderWhenScrollInView.prototype.body = $("body").get(0);
            ImageLoaderWhenScrollInView.prototype.isElementInViewport = isElementInViewport;
            ImageLoaderWhenScrollInView.prototype.prepareElement = function () {
                this.$element.addClass("hided");
            };
            ImageLoaderWhenScrollInView.prototype.setImgSrc = function () {
                var self = this;
                this.$element.one("load error", function () {
                    self.$element.removeClass("hided");
                });
                this.$element.attr("src", ko.utils.unwrapObservable(this.options.src));
            };
            ImageLoaderWhenScrollInView.prototype.checkVisibility = function () {
                if (!this.body.contains(this.$element.get(0))) {
                    this.disposeEventHandlers();
                    return false;
                }
                if (this.isElementInViewport(this.$element, this.$scrollContainer, true)) {
                    this.disposeEventHandlers();
                    this.setImgSrc();
                    return true;
                }
                return false;
            };
            ImageLoaderWhenScrollInView.prototype.disposeEventHandlers = function () {
                this.$scrollContainer.off(this.eventId);
                $(window).off(this.eventId);
                if (this.checkVisibilityHandler) {
                    this.checkVisibilityHandler.dispose();
                    this.checkVisibilityHandler = null;
                }
            };
            ImageLoaderWhenScrollInView.prototype.waitForBecomeVisible = function () {
                var debouncedCheckVisibility = _.bind(_.debounce(this.checkVisibility, 1000), this);
                if (!this.checkVisibility()) {
                    this.$scrollContainer.on("scroll" + this.eventId, debouncedCheckVisibility);
                    $(window).on("resize" + this.eventId, debouncedCheckVisibility);
                    if (ko.isObservable(this.options.checkVisibility)) {
                        this.checkVisibilityHandler = this.options.checkVisibility.subscribe(this.checkVisibility, this);
                    }
                }
            };

            ko.bindingHandlers.lazyLoadingImage = {
                init: function (element, valueAccessor) {
                    var loader = new ImageLoaderWhenScrollInView(element, valueAccessor);
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
