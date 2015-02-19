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
            searchResults: []
        };
    },
    render: function () {
        var xMarkup = null, xDropdownList = null, xDropdownPart = null;

        var cx = React.addons.classSet,
            ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

        var dropDownWrapperClass = cx({
            'expanded': !!this.state.searchResults.length,
            'geosearch-dropdown-wrapper': true
        });

        xDropdownList = _.map(this.state.searchResults, function (r) {
            return <li key={r.place_id}>
                {r.formatted_address}
            </li>;
        });

        xDropdownPart = <ReactCSSTransitionGroup transitionName="geosearch-dropdown-transition" component="div" className="geosearch-dropdown-wrapper expanded">
            {this.state.searchResults.length ? <div className="geosearch-dropdown" key="my-very-uniq-key">
                <ul>{xDropdownList}</ul>
            </div> : null}
        </ReactCSSTransitionGroup>;

        xMarkup = <section id="geosearch-control" className="geosearch-control-wrapper">
            <form name="geosearch-form" onSubmit={this.handleFormSubmit}>
                <input required placeholder="Search for place" value={this.state.searchToken} onChange={this.handleSearchInput} className="geosearch-input" type="search" />
                <button type="submit" className="geosearch-submit-button">
                    <span className="icon icon-search"></span>
                </button>
            </form>
            {xDropdownPart}
        </section>;

        return xMarkup;
    },
    handleSearchInput: function (event) {
        actions.geosearch.geosearchTokenChanged(event.target.value);
    },
    handleFormSubmit: function (event) {
        console.log(arguments);
        event.preventDefault();
        actions.geosearch.geosearchFormSubmit();
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
            searchResults: newResults
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