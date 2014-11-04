var bindingName = 'datetimeText',
    libs = require('../libs'),
    ko = libs.ko,
    $ = libs.$,
    _ = libs._;

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

var twDateParse = function (dateString) {
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
    var dt = new Date(ecmaDateString);
    return dt;
};

var initFn = function (element, valueAccessor) {
    var dtText = ko.unwrap(valueAccessor());
    var dt = twDateParse(dtText);
    $(element).text(dt.toLocaleString());
};

var register = function () {
    ko.bindingHandlers[bindingName] = {
        init: initFn
    };
};

module.exports = {
    register: register
};