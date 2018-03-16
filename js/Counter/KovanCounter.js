var mongoose = require('mongoose');
var KovanCounterSchema = new mongoose.Schema({
    _id: {type: String, required: true},
    seq: { type: Number, default: 1 }
});

mongoose.model('KovanCounter', KovanCounterSchema);
module.exports = mongoose.model('KovanCounter');
