var mongoose = require('mongoose');

var ContractSchema = new mongoose.Schema({contractid:String,date:String,race_duration:String,betting_duration:String,end_time:String,race_number:String});

mongoose.model('KovanContract',ContractSchema);
module.exports = mongoose.model('KovanContract');
