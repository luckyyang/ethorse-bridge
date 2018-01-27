var mongoose = require('mongoose'); 
var ContractSchema = new mongoose.Schema({contractid:String,date:String});

mongoose.model('Contract',ContractSchema);
module.exports = mongoose.model('Contract');