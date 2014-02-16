/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var authCallback = require('./routes/auth_callback');
var auth = require('./routes/auth');
var twttrProxy = require('./routes/twttr_proxy');
var logout = require('./routes/logout');
var http = require('http');
var path = require('path');
var WebSocket = require('ws');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.set("trust proxy", true);
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.cookieParser('A12-dmcd=Asd365%bjldkloed(uhn'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(require('less-middleware')({ src: path.join(__dirname, 'public') }));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);
app.get('/auth_callback', authCallback.redirectFromAuth);
app.get('/auth', auth.auth);
app.get('/searchtweets', twttrProxy.searchTweets);
app.get('/logout', logout.logout);

var httpServer = http.createServer(app);
httpServer.listen(app.get('port'), '127.0.0.1', function () {
    console.log('Express server listening on port ' + app.get('port'));
});

var wsServer = new WebSocket.Server({server: httpServer});
wsServer.on('connection', function (ws) {
    require('./routes/twttr_ws').webSocketServer(ws);
});
