var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/prod-contracts');

module.exports = mongoose
