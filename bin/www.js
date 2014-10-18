#!/usr/bin/env node
var debug = require('debug')('geotwttr');
var app = require('../app');
var wsServer = require('../services/ws');

app.set('port', process.env.PORT || 3000);

// setup http server
var server = app.listen(app.get('port'), function() {
    debug('Express server listening on port ' + server.address().port);
});

// setup web socket server
var wsServerInstance = wsServer.createServer(server);
