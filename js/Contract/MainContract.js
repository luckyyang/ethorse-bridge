// var mongoose = require('mongoose');
var mongoose = require('../db');
var ContractSchema = new mongoose.Schema({contractid:String,date:String,race_duration:String,betting_duration:String,end_time:String});

mongoose.model('MainContract',ContractSchema);
module.exports = mongoose.model('MainContract');
