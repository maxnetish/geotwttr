var libs = require('../libs'),
    React = libs.React,
    _ = libs._,
    actions = require('../actions'),
    stores = require('../stores'),
    geosearchStore = stores.geosearchStore;

var GoogleMapGeosearch = React.createClass({
    getInitialState: function () {
        return {
            searchToken: null,
            searchResults: [],
            searchResultsIds: []
        };
    },
    shouldComponentUpdate: function (nextProps, nextState) {
        var should =  nextState.searchToken!==this.state.searchToken;
        if(should){
            return should;
        }
        return !_.isEqual(nextState.searchResultsIds, this.state.searchResultsIds);
    },
    render: function () {
        console.log('render GoogleMapGeosearchComponent');
        var xMarkup = null, xDropdownList = null, xDropdownPart = null,
            self = this;

        var cx = React.addons.classSet,
            ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

        var dropDownWrapperClass = cx({
            'expanded': !!this.state.searchResults.length,
            'geosearch-dropdown-wrapper': true
        });

        xDropdownList = _.map(this.state.searchResults, function (r) {
            var iconClass = 'place-icon icon ' + r.knownType.icon;
            var countryCodeClass = r.countryCode ? 'label' : 'label hidden';
            return <li key={r.place_id} onClick={self.handleListItemClick.bind(self, r)}>
                <span className={iconClass}></span>
                <div className="place-description">
                    <span className={countryCodeClass}>{r.countryCode}</span>
                    {r.formatted_address}
                </div>
            </li>;
        });

        xDropdownPart = <ReactCSSTransitionGroup transitionName="geosearch-dropdown-transition" component="div" className="geosearch-dropdown-wrapper expanded">
            {this.state.searchResults.length ? <div className="geosearch-dropdown" key="my-very-uniq-key">
                <ReactCSSTransitionGroup transitionName="geosearch-item-transition" component="ul">{xDropdownList}</ReactCSSTransitionGroup>
            </div> : null}
        </ReactCSSTransitionGroup>;

        xMarkup = <section id="geosearch-control" className="geosearch-control-wrapper">
            <input required placeholder="Search for place" value={this.state.searchToken} onChange={this.handleSearchInput} className="geosearch-input" type="search" />
            {xDropdownPart}
        </section>;

        return xMarkup;
    },
    handleSearchInput: function (event) {
        actions.geosearch.geosearchTokenChanged(event.target.value);
    },
    handleListItemClick: function (item) {
        console.log(item);
        actions.geosearch.geosearchSelectItem(item);
    },
    _onUpdateSearchToken: function () {
        var token = geosearchStore.getSearchToken();
        this.setState({
            searchToken: token
        });
    },
    _onUpdateSearchResults: function () {
        var newResults = geosearchStore.getSearchResults();
        this.setState({
            searchResults: newResults,
            searchResultsIds: _.map(newResults, function(r){
                return r.place_id;
            })
        });
    },
    componentDidMount: function () {
        geosearchStore.on(geosearchStore.events.EVENT_TOKEN_CHANGED, this._onUpdateSearchToken);
        geosearchStore.on(geosearchStore.events.EVENT_SEARCH_RESULTS_CHANGED, this._onUpdateSearchResults);
    },
    componentWillUnmount: function () {
        geosearchStore.removeListener(geosearchStore.events.EVENT_TOKEN_CHANGED, this._onUpdateSearchToken);
        geosearchStore.removeListener(geosearchStore.events.EVENT_SEARCH_RESULTS_CHANGED, this._onUpdateSearchResults);
    }
});

module.exports = {
    GoogleMapGeosearch: GoogleMapGeosearch
};