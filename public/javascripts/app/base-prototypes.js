/**
 * Created by Gordeev on 02.03.14.
 */
define([], function () {
    (function () {
        if (!String.prototype.endsWith) {
            Object.defineProperty(String.prototype, 'endsWith', {
                enumerable: false,
                configurable: false,
                writable: false,
                value: function (searchString, position) {
                    position = position || this.length;
                    position = position - searchString.length;
                    var lastIndex = this.lastIndexOf(searchString);
                    return lastIndex !== -1 && lastIndex === position;
                }
            });
        }
        if (!String.prototype.contains) {
            String.prototype.contains = function () {
                return String.prototype.indexOf.apply(this, arguments) !== -1;
            };
        }
    })();
});