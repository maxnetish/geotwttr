var libs = require('../libs'),
    React = libs.React,
    actions = require('../actions'),
    stores = require('../stores'),
    geosearchStore = stores.geosearchStore;

var GoogleMapGeosearch = React.createClass({
    getInitialState: function () {
        return {
            searchToken: null
        };
    },
    render: function () {
        var xMarkup = null;

        if (this.props.visible) {
            xMarkup = <section id="geosearch-control" className="geosearch-control-wrapper">
                <form name="geosearch-form" onSubmit={this.handleFormSubmit}>
                    <input required placeholder="Search for place" value={this.state.searchToken} onChange={this.handleSearchInput} className="geosearch-input" type="search" />
                    <button type="submit" className="geosearch-submit-button">
                        <span className="icon icon-search"></span>
                    </button>
                </form>
            </section>;
        }

        return xMarkup;
    },
    handleSearchInput: function (event) {
        actions.geosearch.geosearchTokenChanged(event.target.value);
    },
    handleFormSubmit: function (event) {
        console.log(arguments);
        event.preventDefault();
    },
    _onUpdateSearchToken: function () {
        var token = geosearchStore.getSearchToken();
        this.setState({
            searchToken: token
        });
    },
    componentDidMount: function () {
        geosearchStore.on(geosearchStore.events.EVENT_TOKEN_CHANGED, this._onUpdateSearchToken);
    },
    componentWillUnmount: function () {
        geosearchStore.removeListener(geosearchStore.events.EVENT_TOKEN_CHANGED, this._onUpdateSearchToken);
    }
});

module.exports = {
    GoogleMapGeosearch: GoogleMapGeosearch
};