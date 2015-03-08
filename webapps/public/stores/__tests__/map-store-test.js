jest.dontMock('lodash');
jest.dontMock('../map-store');
//jest.dontMock('../../services/local-storage');

describe('map-store', function () {
    var _, dispatcher, actions, store, dispatcherCallback, eventCallback, localStorage;

    beforeEach(function () {
        _ = require('lodash');

        // mock debounce calls
        spyOn(_, 'debounce').andCallFake(function (func) {
            return function () {
                func.apply(this, arguments);
            };
        });

        // mock localStorage
        localStorage = require('../../services/local-storage');
        localStorage.read.mockImplementation(function (key, defaultValue) {
            return defaultValue;
        });

        dispatcher = require('../../dispatcher');
        actions = require('../../actions');
        store = require('../map-store');

        // mock dispatcher callback
        dispatcherCallback = dispatcher.register.mock.calls[0][0];
        eventCallback = jest.genMockFunction();

        // pass initials selection center:
        dispatcherCallback({
            actionType: actions.types.MAP.CLICK,
            actionArgs: {
                coords: {
                    lat: 10.234,
                    lng: -7.890
                }
            }
        });
        // selection radius
        dispatcherCallback({
            actionType: actions.types.MAP.SELECTION_RADIUS_CHANGED,
            actionArgs: {
                radius: 12345
            }
        });
        // and area selection
        dispatcherCallback({
            actionType: actions.types.TWEET.PLACE_CLICK,
            actionArgs: {
                twitterPlace: {
                    foo: 'bar'
                }
            }
        });
    });

    afterEach(function () {
        store.removeAllListeners();
    });

    it('Should: after map click emit SELECTION_CHANGE and set new selection center', function () {
        var myCoords = {
            lat: 1.23456,
            lng: 7.89012
        }, newCoords;

        store.on(store.events.SELECTION_CHANGE, eventCallback);
        dispatcherCallback({
            actionType: actions.types.MAP.CLICK,
            actionArgs: {
                coords: myCoords
            }
        });
        newCoords = store.getSelection().center;

        expect(eventCallback.mock.calls.length).toBe(1);
        expect(newCoords.lat).toBe(myCoords.lat);
        expect(newCoords.lng).toBe(myCoords.lng);
    });

    it('Should not emit SELECTION_CHANGE event when MAP.CLICK have same coords', function () {
        var myCoords = {
            lat: 1.23456,
            lng: 7.89012
        };

        // set selection center:
        dispatcherCallback({
            actionType: actions.types.MAP.CLICK,
            actionArgs: {
                coords: myCoords
            }
        });

        // subscribe:
        store.on(store.events.SELECTION_CHANGE, eventCallback);

        // and pass same coords:
        dispatcherCallback({
            actionType: actions.types.MAP.CLICK,
            actionArgs: {
                coords: myCoords
            }
        });

        expect(eventCallback.mock.calls.length).toBe(0);
    });

    it('Should emit SELECTION_AREA_CHANGE and clear areaSelection after MAP.CLICK', function () {
        var myCoords = {
            lat: 1.23456,
            lng: 7.89012
        }, newAreaSelection;


        store.on(store.events.SELECTION_AREA_CHANGE, eventCallback);
        dispatcherCallback({
            actionType: actions.types.MAP.CLICK,
            actionArgs: {
                coords: myCoords
            }
        });

        newAreaSelection = store.getAreaSelection();

        expect(eventCallback.mock.calls.length).toBe(1);
        _.forOwn(newAreaSelection, function (propValue) {
            expect(propValue).toBeFalsy();
        });
    });

    it('Should: after MAP.SELECTION_RADIUS_CHANGED set new radius and emit SELECTION_CHANGE', function () {
        var myRadius = 4567, newRadius;
        store.on(store.events.SELECTION_CHANGE, eventCallback);
        dispatcherCallback({
            actionType: actions.types.MAP.SELECTION_RADIUS_CHANGED,
            actionArgs: {
                radius: myRadius
            }
        });
        newRadius = store.getSelection().radius;
        expect(eventCallback.mock.calls.length).toBe(1);
        expect(newRadius).toBe(myRadius);
    });

    it('Should not emit SELECTION_CHANGE after MAP.SELECTION_RADIUS_CHANGED when radius not change', function () {
        var myRadius = 4567;

        dispatcherCallback({
            actionType: actions.types.MAP.SELECTION_RADIUS_CHANGED,
            actionArgs: {
                radius: myRadius
            }
        });
        store.on(store.events.SELECTION_CHANGE, eventCallback);
        dispatcherCallback({
            actionType: actions.types.MAP.SELECTION_RADIUS_CHANGED,
            actionArgs: {
                radius: myRadius
            }
        });
        expect(eventCallback.mock.calls.length).toBe(0);
    });

    it('After MAP.SELECTION_CENTER_CHANGE set new center and emit SELECTION_CHANGE', function () {
        var myCenter = {
            lat: 1.234,
            lng: 5.678
        }, newCenter;

        store.on(store.events.SELECTION_CHANGE, eventCallback);
        dispatcherCallback({
            actionType: actions.types.MAP.SELECTION_CENTER_CHANGED,
            actionArgs: {
                coords: myCenter
            }
        });
        newCenter = store.getSelection().center;

        expect(eventCallback.mock.calls.length).toBe(1);
        expect(newCenter.lat).toBe(myCenter.lat);
        expect(newCenter.lng).toBe(myCenter.lng);
    });

    it('Should clear area selection and emit SELECTION_AREA_CHANGE after MAP.SELECTION_CENTER_CHANGE', function () {
        var myCenter = {
            lat: 1.234,
            lng: 5.678
        }, newAreaSelection;

        store.on(store.events.SELECTION_AREA_CHANGE, eventCallback);
        dispatcherCallback({
            actionType: actions.types.MAP.SELECTION_CENTER_CHANGED,
            actionArgs: {
                coords: myCenter
            }
        });
        newAreaSelection = store.getAreaSelection();

        expect(eventCallback.mock.calls.length).toBe(1);
        _.forOwn(newAreaSelection, function (propValue) {
            expect(propValue).toBeFalsy();
        });
    });

    it('Should not emit SELECTION_CHANGE after MAP.SELECTION_CENTER_CHANGE when center not change', function () {
        var myCenter = {
            lat: 1.234,
            lng: 5.678
        }, newCenter;

        dispatcherCallback({
            actionType: actions.types.MAP.SELECTION_CENTER_CHANGED,
            actionArgs: {
                coords: myCenter
            }
        });
        store.on(store.events.SELECTION_CHANGE, eventCallback);
        dispatcherCallback({
            actionType: actions.types.MAP.SELECTION_CENTER_CHANGED,
            actionArgs: {
                coords: myCenter
            }
        });

        expect(eventCallback.mock.calls.length).toBe(0);
    });

    it('After MAP.CENTER_CHANGE should set new center and emit CHANGE and store in local storage', function () {
        var myCenter = {
            lat: 12.345,
            lng: 67.890
        }, newCenter;

        store.on(store.events.CHANGE, eventCallback);
        dispatcherCallback({
            actionType: actions.types.MAP.CENTER_CHANGED,
            actionArgs: {
                coords: myCenter
            }
        });

        newCenter = store.getCenter();

        expect(eventCallback.mock.calls.length).toBe(1);
        expect(newCenter).toEqual(myCenter);
        expect(localStorage.write.mock.calls.length).toBe(1);
        expect(localStorage.write.mock.calls[0][0]).toBe(localStorage.keys.CENTER);
        expect(localStorage.write.mock.calls[0][1]).toEqual(myCenter);
    });

    it('Should not emit CHANGE after MAP.CENTER_CHANGE if center actually not change', function () {
        var myCenter = {
            lat: 12.345,
            lng: 67.890
        };

        dispatcherCallback({
            actionType: actions.types.MAP.CENTER_CHANGED,
            actionArgs: {
                coords: myCenter
            }
        });
        localStorage.write.mockClear();
        store.on(store.events.CHANGE, eventCallback);
        dispatcherCallback({
            actionType: actions.types.MAP.CENTER_CHANGED,
            actionArgs: {
                coords: myCenter
            }
        });

        expect(eventCallback.mock.calls.length).toBe(0);
        expect(localStorage.write.mock.calls.length).toBe(0);
    });

    it('After MAP.ZOOM_CHANGE should set new zoom, emit CHANGE and store new zoom', function () {
        var myZoom = 7,
            newZoom;

        store.on(store.events.CHANGE, eventCallback);
        dispatcherCallback({
            actionType: actions.types.MAP.ZOOM_CHANGED,
            actionArgs: {
                zoom: myZoom
            }
        });

        newZoom = store.getZoom();

        expect(eventCallback.mock.calls.length).toBe(1);
        expect(newZoom).toBe(myZoom);
        expect(localStorage.write.mock.calls.length).toBe(1);
        expect(localStorage.write.mock.calls[0][0]).toBe(localStorage.keys.ZOOM);
        expect(localStorage.write.mock.calls[0][1]).toEqual(myZoom);
    });

    it('Should not emit CHANGE after MAP.ZOOM_CHANGE if actally zoom not change', function () {
        var myZoom = 7;

        dispatcherCallback({
            actionType: actions.types.MAP.ZOOM_CHANGED,
            actionArgs: {
                zoom: myZoom
            }
        });
        localStorage.write.mockClear();
        store.on(store.events.CHANGE, eventCallback);
        dispatcherCallback({
            actionType: actions.types.MAP.ZOOM_CHANGED,
            actionArgs: {
                zoom: myZoom
            }
        });

        expect(eventCallback.mock.calls.length).toBe(0);
        expect(localStorage.write.mock.calls.length).toBe(0);
    });

    it('After SELECTION_DETAILS.DETAIL_LINE_CLICK should emit SELECTION_AREA_CHANGE, set areaSelection.geocoderResult and clear another props of areaSelection', function () {
        var myGeocoderResult = {
            mockInfo: 'bar'
        }, newGeocoderResult, newSelectionArea;

        store.on(store.events.SELECTION_AREA_CHANGE, eventCallback);
        dispatcherCallback({
            actionType: actions.types.SELECTION_DETAILS.DETAIL_LINE_CLICK,
            actionArgs: {
                detailLineInfo: myGeocoderResult
            }
        });
        newSelectionArea = store.getAreaSelection();
        newGeocoderResult = newSelectionArea.geocoderResult;

        expect(eventCallback.mock.calls.length).toBe(1);
        _.forOwn(newSelectionArea, function (propValue, propName) {
            if (propName === 'geocoderResult') {
                expect(newGeocoderResult).toEqual(myGeocoderResult);
            } else {
                expect(propValue).toBeFalsy();
            }
        });
    });
});