/**
 * Created by Gordeev on 07.09.2014.
 */
#!/usr/bin/env node
var debug = require('debug')('jellyblog');
var app = require('../app');

app.set('port', process.env.PORT || 3000);

var server = app.listen(app.get('port'), function() {
    debug('Express server listening on port ' + server.address().port);
});
