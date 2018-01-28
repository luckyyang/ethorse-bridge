// app.js
var express = require('express');
var app = express();
var db = require('./db');





var ContractController = require('./contract/ContractController');
app.use('/contract', ContractController);
module.exports = app;