var express = require('express');
var http = require('http');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var responseTime = require('response-time');
var cookieSecret = 'A12-dmcd=Asd365%bjldkloed(uhn';
var routes = require('./routes/index');

var app = express();

// show current mode in console
console.log('Express mode: ' + app.get('env'));

// setup logger
if (app.get('env') === 'development') {
    app.use(logger('dev'));
}

// to properly work behind nginx
app.set("trust proxy", true);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// adds X-Response-Time header
app.use(responseTime(1));

// req parsers
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser(cookieSecret));

// use directory for static (will be useful without nginx)
app.use(express.static(path.join(__dirname, 'public')));

// setup routes
app.use('/', routes);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use('/api', function (err, req, res, next) {
        var status = err.status || 500;
        res.status(status);
        res.send({
            status: status,
            message: err.message,
            error: err,
            stack: err.stack
        });
    });
    app.use(function (err, req, res, next) {
        var status = err.status || 500;
        var responseVm = {
            message: err.message,
            error: err
        };

        res.status(status);

        res.render('error', responseVm);
    });
} else {
// production error handler
// no stacktraces leaked to user
    app.use('/api', function (err, req, res, next) {
        var status = err.status || 500;
        res.status(status);
        res.send({
            status: status,
            message: err.message,
            error: {}
        });
    });
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        var responseVm = {
            message: err.message,
            error: {}
        };

        res.render('error', responseVm);
    });
}

module.exports = app;
