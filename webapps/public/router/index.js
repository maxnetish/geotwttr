/**
 * Created by Gordeev on 07.09.2014.
 */

var path = require('../libs').path;

var definitions = Object.freeze({
    login: {
        component: '',
        viewModel: vmPosts,
        route: '#!/posts(/:query)',
        on: vmPosts.activate
    }
});

module.exports = {
    run: function(){}
};