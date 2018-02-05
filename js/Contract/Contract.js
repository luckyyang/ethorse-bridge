var mongoose = require('mongoose'); 
var ContractSchema = new mongoose.Schema({contractid:String,date:String,race_duration:String,betting_duration:String,end_time:String});

mongoose.model('Contract',ContractSchema);
module.exports = mongoose.model('Contract');