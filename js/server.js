// server.js
var app = require('./app');
var port = process.env.PORT || 3000;
var host='0.0.0.0';

var server = app.listen( port,host, function() {
  console.log('Express server listening on port ' + port);
});
