// server.js
var app = require('./app');
var port = process.env.PORT || 3000;
var host='192.168.1.100';

var server = app.listen( port,host, function() {
  console.log('Express server listening on port ' + port);
});
