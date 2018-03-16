var mongoose = require('mongoose');
var MainCounterSchema = new mongoose.Schema({
    _id: {type: String, required: true},
    seq: { type: Number, default: 1 }
});

mongoose.model('MainCounter', MainCounterSchema);
module.exports = mongoose.model('MainCounter');
