// app.js
var express = require('express');
var app = express();
var db = require('./db');
var cors = require('cors')


app.use(cors())
var ContractController = require(__dirname+'/Contract/ContractController');
app.use('/contract', ContractController);

module.exports = app;
