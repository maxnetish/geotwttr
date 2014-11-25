var keys = Object.freeze({
   CENTER: 'geotwttr_center',
   ZOOM: 'geotwttr_zoom'
});

var storage = (function () {
    var global = (function () {
            return this;
        })(),
        STORAGE_PROP = 'localStorage',
        result;

    try {
        result = global[STORAGE_PROP];
    } catch (e) {
        result = null;
    }
    return result;
})();

var write = function (key, value) {
    var valueToStore;

    if (!storage || !key) {
        return;
    }

    if (!value) {
        storage.removeItem(key);
        return;
    }

    if (typeof value === 'function') {
        valueToStore = value();
    } else {
        valueToStore = value;
    }
    valueToStore = JSON.stringify(valueToStore);

    storage.setItem(key, valueToStore);
};

var read = function (key, defaultValue) {
    var result;

    if (!storage || !key) {
        return defaultValue;
    }

    result = storage.getItem(key);

    if (!result) {
        return defaultValue;
    }

    try {
        result = JSON.parse(result);
    }
    catch (err) {
        result = defaultValue;
    }

    return result;
};

var registerPermanentObservable = function(key, observ, defaultObservValue){
    var initialValue = read(key, defaultObservValue);

    observ(initialValue);

    observ.subscribe(function(newValue){
        write(key, newValue);
    });
};

module.exports = {
    read: read,
    write: write,
    registerPermanentObservable: registerPermanentObservable,
    keys: keys
};