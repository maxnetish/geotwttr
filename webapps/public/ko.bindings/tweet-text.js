var bindingName = 'tweetText',
    libs = require('../libs'),
    ko = libs.ko,
    $ = libs.$,
    _ = libs._;

var simpleTextEntity = 'simple';
var space = ' ';

var normalizeEntities = function (tweetText, tweetEntities) {
    var entities = []; // entities sorted by beginning position in text
    var simpleChunks = []; // chunks of original text without entity,
    var preEntity;
    _.each(tweetEntities, function (oneEntityType, oneEntityTypeKey) {
        _.each(oneEntityType, function (oneEntity) {
            var normalizedEntity = {
                    'type': oneEntityTypeKey
                },
                sortedIndex;
            _.extend(normalizedEntity, oneEntity);
            sortedIndex = _.sortedIndex(entities, normalizedEntity, function (item) {
                return item.indices[0];
            });
            entities.splice(sortedIndex, 0, normalizedEntity);
        });
    });

    _.each(entities, function (ent) {
        var preIndex = preEntity ? preEntity.indices[1] + 1 : 0;
        if (ent.indices[0] !== preIndex) {
            simpleChunks.push({
                'type': simpleTextEntity,
                indices: [
                    preIndex,
                    ent.indices[0] - 1
                ]
            });
        }
        preEntity = ent;
    });
    if (preEntity && preEntity.indices[1] < (tweetText.length - 1)) {
        simpleChunks.push({
            'type': simpleTextEntity,
            indices: [
                preEntity.indices[1] + 1,
                tweetText.length - 1
            ]
        });
    } else if (!preEntity) {
        simpleChunks.push({
            'type': simpleTextEntity,
            indices: [
                0,
                tweetText.length - 1
            ]
        });
    }
    _.each(simpleChunks, function (oneChunk) {
        var sortedIndex = _.sortedIndex(entities, oneChunk, function (item) {
            return item.indices[0];
        });
        entities.splice(sortedIndex, 0, oneChunk);
    });

    return entities;
};

var createFragment = {
    'simple': function (originalTweetText, entity) {
        return $('<span>')
            .addClass('plain')
            .text(originalTweetText.substring(entity.indices[0], entity.indices[1] + 1));
    },
    'urls': function (originalTweetText, entity) {
        return $('<a>')
            .attr({
                target: '_blank',
                href: entity.expanded_url
            })
            .addClass('entity url notoggle')
            .text(entity.display_url);
    },
    'user_mentions': function (originalTweetText, entity) {
        return $("<a>")
            .attr({
                target: '_blank',
                href: 'https://twitter.com/' + entity.screen_name
            })
            .addClass('entity user-mention notoggle')
            .text(entity.screen_name);
    },
    'hashtags': function (originalTweetText, entity) {
        return $("<span>")
            .addClass('entity hashtag notoggle')
            .text(entity.text);
    },
    'photo': function(originalTweetText, entity){
        return $("<a>")
            .attr({
                target: '_blank',
                href: entity.expanded_url
            })
            .addClass('entity url photo notoggle')
            .text(entity.display_url);
    },
    'media': function (originalTweetText, entity) {
        return $("<a>")
            .attr({
                target: '_blank',
                href: entity.expanded_url
            })
            .addClass('entity url notoggle')
            .text(entity.display_url);
    },
    'default': function (originalTweetText, entity) {
        console.log(entity);
        return $('<span>')
            .addClass('entity notoggle')
            .text(originalTweetText.substring(entity.indices[0], entity.indices[1] + 1));
    }
};

var initFn = function (element, valueAccessor, allBindings, viewModel, bindingContext) {
    var $element = $(element),
        tweet = ko.unwrap(valueAccessor()),
        ents = normalizeEntities(tweet.text, tweet.entities);

    _.each(ents, function (entity) {
        var actualEntityType = entity.type,
            fragment;
        actualEntityType = createFragment.hasOwnProperty(actualEntityType) ? actualEntityType : 'default';
        fragment = createFragment[actualEntityType](tweet.text, entity);
        $element.append(fragment);
    });
};

var register = function () {
    ko.bindingHandlers[bindingName] = {
        init: initFn
    };
};

module.exports = {
    register: register
};