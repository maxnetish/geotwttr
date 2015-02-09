var libs = require('./../libs'),
    services = require('../services'),
    React = libs.React,
    _ = libs._;

var GoogleMapComponent = require('./google-map.jsx').MapControl;
var HeaderAccountCardComponent = require('./header-account-card.jsx').Control;
var IndicatorComponent = require('./indicator.jsx').Control;

var rootElementInstance, appConfig, callSetState;

var RootElement = React.createClass({
    getInitialState: function () {
        var storedCenter = services.localStorage.read(services.localStorage.keys.CENTER, {
                lat: 37.419,
                lng: -122.080
            }),
            storedZoom = services.localStorage.read(services.localStorage.keys.ZOOM, 6);

        return _.assign(appConfig, {
            mapCenter: storedCenter,
            mapZoom: storedZoom
        });
    },
    render: function () {
        console.log('render root element');
        console.log(this.state);
        if (!callSetState) {
            callSetState = _.bind(this.setState, this);
        }
        return <div>
            <header>
                <HeaderAccountCardComponent userInfo={this.state.userInfo}/>
                <h1 className="text-center">{this.state.title}</h1>
            </header>
            <div className="pane-left pane">
                <div className="relative full-height">
                    <GoogleMapComponent selection={this.state.mapSelection} mapCenter={this.state.mapCenter} mapZoom={this.state.mapZoom} setState={callSetState}/>
                </div>
            </div>
            <div className="pane-right pane"></div>
            <footer>
                <IndicatorComponent value={this.state.visibleCount} />
                <IndicatorComponent value={this.state.addingRate} unit="tw/min" />
                <a href="https://twitter.com/maxnetish" className="twitter-follow-button" data-show-count="false" data-lang={this.state.langCode}>Follow me</a>
            </footer>
        </div>;
    },
    shouldComponentUpdate: function (nextProps, nextState) {
        // store params:
        storeMapParams(nextState.mapCenter, nextState.mapZoom);

        return true;
    }
});

var initInBrowser = function (rootNode, config) {
    appConfig = config || {};
    rootElementInstance = React.render(<RootElement />, rootNode);
};

var renderInNode = function (config) {
    appConfig = config || {};
    return React.renderToString(<RootElement />);
};

var setState = function (partialState, callback) {
    if (rootElementInstance && _.isFunction(rootElementInstance.setState)) {
        return rootElementInstance.setState(partialState, callback);
    }
    return false;
};

var getState = function () {
    return rootElementInstance.state;
};

var storeMapParams = _.debounce(function (center, zoom) {
    if (center) {
        services.localStorage.write(services.localStorage.keys.CENTER, center);
    }
    if (zoom) {
        services.localStorage.write(services.localStorage.keys.ZOOM, zoom);
    }
}, 500);

module.exports = {
    initInBrowser: initInBrowser,
    setState: setState,
    renderInNode: renderInNode,
    getState: getState
};