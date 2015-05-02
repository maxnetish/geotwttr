var
    _ = require('lodash');

var rtlRegex = /^(ar|he|iw|ur)/;

var monthsDict = {
    'Jan': '01',
    'Feb': '02',
    'Mar': '03',
    'Apr': '04',
    'May': '05',
    'Jun': '06',
    'Jul': '07',
    'Aug': '08',
    'Sep': '09',
    'Oct': '10',
    'Nov': '11',
    'Dec': '12'
};

var detectRtl = function (tw) {
    var lang = tw.lang;
    if (!lang || lang === 'und') {
        return false;
    }
    return !!rtlRegex.test(lang);
};

var humanizeCoordinates = function (coordinates) {
    var result, lat, lng;
    if (!coordinates) {
        return result;
    }
    if (!_.isArray(coordinates.coordinates)) {
        return result;
    }
    lat = coordinates.coordinates[1].toFixed(3);
    lng = coordinates.coordinates[0].toFixed(3);
    result = ['lat: ', lat, '; lng: ', lng].join('');
    return result;
};

var parseTweetDate = function (dateString) {
    // Sun Nov 02 21:05:43 +0000 2014
    // to ecma script format (http://www.ecma-international.org/ecma-262/5.1/#sec-15.9.1.15)
    // YYYY-MM-DDTHH:mm:ss.sssZ

    var parts = dateString.split(' ');

    var year = parts[5];
    var month = monthsDict[parts[1]];
    var day = parts[2];
    var time = parts[3];
    var tz = 'Z';   // twitter didn't use time zone, always +0000

    var ecmaDateString = year + '-' + month + '-' + day + 'T' + time + tz;
    return new Date(ecmaDateString);
};

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
                'type': 'simple',
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
            'type': 'simple',
            indices: [
                preEntity.indices[1] + 1,
                tweetText.length - 1
            ]
        });
    } else if (!preEntity) {
        simpleChunks.push({
            'type': 'simple',
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

function buildMediaInfo(tw) {
    var result = {
        hasMedia: false
    };

    if (tw.extended_entities && tw.extended_entities.media && tw.extended_entities.media.length) {
        result.twitterMedia = tw.extended_entities.media;
        result.hasMedia = true;
    }

    return result;
}

var normalize = function (tw) {
    var isRetweet = !!tw.retweeted_status;
    var originalTweet = isRetweet ? tw.retweeted_status : tw;

    //if (tw.extended_entities) {
    //    console.log('EXTENDED');
    //    if(_.some(tw.extended_entities.media, function(ent){
    //            return ent.type!='photo'
    //        })){
    //        console.log('NO PHOTO!');
    //    }
    //    console.log(tw.extended_entities);
    //}

    return {
        isRetweet: isRetweet,
        profileOriginalUrl: 'https://twitter.com/' + originalTweet.user.screen_name,
        avatarUrl: originalTweet.user.profile_image_url,
        userOriginalName: originalTweet.user.name,
        userOriginalScreenName: originalTweet.user.screen_name,
        textOriginal: originalTweet.text,
        entitiesOriginal: normalizeEntities(originalTweet.text, originalTweet.entities),
        extendedEntities: tw.extended_entities,
        tweetUrl: 'https://twitter.com/' + tw.user.screen_name + '/status/' + tw.id_str,
        createdAtOriginal: parseTweetDate(originalTweet.created_at).toLocaleString(),
        place: tw.place,
        profileSenderUrl: 'https://twitter.com/' + tw.user.screen_name,
        senderScreenName: tw.user.screen_name,
        useRtl: detectRtl(tw),
        shouldVisible: true,
        coordinates: tw.coordinates,
        coordinatesH: humanizeCoordinates(tw.coordinates),
        mediaInfo: buildMediaInfo(tw)
    };
};

var createViewModel = function (tw) {
    return _.create(tw, normalize(tw));
};

module.exports = {
    create: createViewModel
};