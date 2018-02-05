// app.js
var express = require('express');
var app = express();
var db = require('./db');
var cors = require('cors')


app.use(cors())

var ContractController = require('./contract/ContractController');
app.use('/contract', ContractController);

module.exports = app;
