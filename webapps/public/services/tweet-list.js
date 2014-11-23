var libs = require('../libs');
var ko = libs.ko;
var _ = libs._;

var TweetListConstructor = function (showImmediateObservable, makeAllVisibleObservable) {
    var self = this,
        _hided = ko.observableArray(),
        start = Date.now();

    var updateAddingRate = function () {
        var milliseconds = Date.now() - start;

        if (milliseconds === 0) {
            self.addingRate('0.00');
            return;
        }

        self.addingRate(((60* 1000 * (self.visible().length + _hided().length)) / milliseconds).toFixed(2));
    };

    var makeAllVisible = function(){
        _.each(_hided(), function (hidedItem) {
            self.visible.unshift(hidedItem);
        });
        _hided.removeAll();
    };

    this.visible = ko.observableArray()
        .extend({
            rateLimit: {
                timeout: 250,
                method: 'notifyAtFixedRate'
            }
        });

    this.hidedCount = ko.computed({
        read: function () {
            return _hided().length;
        },
        deferEvaluation: true,
        pure: true
    }).extend({
        rateLimit: {
            timeout: 500,
            method: 'notifyAtFixedRate'
        }
    });

    this.visibleCount = ko.computed({
        read: function () {
            return self.visible().length;
        },
        deferEvaluation: true,
        pure: true
    }).extend({
        rateLimit: {
            timeout: 500,
            method: 'notifyAtFixedRate'
        }
    });

    this.addingRate = ko.observable('0.00')
        .extend({
            rateLimit: {
                timeout: 5000,
                method: 'notifyAtFixedRate'
            }
        });

    this.addItem = function (item) {
        if (showImmediateObservable()) {
            self.visible.unshift(item);
        } else {
            _hided.push(item);
        }
        updateAddingRate();
    };

    this.reset = function(){
        self.visible.removeAll();
        _hided.removeAll();
        start = Date.now();
    };

    makeAllVisibleObservable.subscribe(makeAllVisible);

    showImmediateObservable.subscribe(function(newValue){
        if(newValue){
            makeAllVisible();
        }
    });
};

module.exports = TweetListConstructor;