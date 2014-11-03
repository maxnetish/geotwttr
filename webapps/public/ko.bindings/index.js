module.exports = {
    register: function(){
        require('./smooth-show-hide').register();
        require('./tweet-text').register();
        require('./datetime-text').register();
    }
};