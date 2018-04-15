// server.js
var app = require('./app');
const cfg = require(__dirname+'/../json/ETHorse.json');
var port = process.env.PORT || cfg.port;
var host='0.0.0.0';

var server = app.listen( port,host, function() {
  console.log('Express server listening on port ' + port);
});
