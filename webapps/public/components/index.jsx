var libs = require('./../libs'),
    services = require('../services'),
    React = libs.React,
    _ = libs._,
    rootStore = require('../stores').rootStore;

var GoogleMapComponent = require('./google-map.jsx').MapControl;
var HeaderAccountCardComponent = require('./header-account-card.jsx').Control;
var IndicatorComponent = require('./indicator.jsx').Control;
var AppTooltipComponent = require('./app-tooltip.jsx').Control;
var SelectionDetailsComponent = require('./selection-details.jsx').SelectionDetailsComponent;

var rootElementInstance, appConfig;

var RootElement = React.createClass({
    getInitialState: function () {
        return _.assign(appConfig, {
            mapLoaded: false,
            mapHasSelection: false
        });
    },
    render: function () {
        console.log('render root element');
        console.log(this.state);
        return <div>
            <header>
                <HeaderAccountCardComponent userInfo={this.state.userInfo}/>
                <h1 className="text-center">{this.state.title}</h1>
            </header>
            <div className="pane-left pane">
                <div className="relative full-height">
                    <GoogleMapComponent />
                </div>
            </div>
            <div className="pane-right pane">
                <SelectionDetailsComponent details={this.state.selectionDetails}/>
                <AppTooltipComponent appTooltipText='Map loaded...' visible={!this.state.mapLoaded} />
                <AppTooltipComponent appTooltipText='Click map to see tweets near...' visible={!this.state.mapHasSelection && this.state.mapLoaded} />
            </div>
            <footer>
                <IndicatorComponent value={this.state.visibleCount} />
                <IndicatorComponent value={this.state.addingRate} unit="tw/min" />
                <a href="https://twitter.com/maxnetish" className="twitter-follow-button" data-show-count="false" data-lang={this.state.langCode}>Follow me</a>
            </footer>
        </div>;
    },
    shouldComponentUpdate: function (nextProps, nextState) {
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

rootStore.addMapLoadedListener(function () {
    var loaded = rootStore.getMapLoaded();
    setState({
        mapLoaded: loaded
    });
});

rootStore.addMapSelectionChangedListener(function () {
    var hasSelection = rootStore.getMapHasSelection();
    setState({
        mapHasSelection: hasSelection
    });
});

rootStore.addMapSelectionDetailsChangedListener(function(){
    var details = rootStore.getSelectionDetails();
    setState({
       selectionDetails: details
    });
});

//mapStore

module.exports = {
    initInBrowser: initInBrowser,
    setState: setState,
    renderInNode: renderInNode,
    getState: getState
};