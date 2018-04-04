// var mongoose = require('mongoose');
var mongoose = require('../db');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
  userid: String,
  participated_race: String,
  participated_horse: String,
  participated_value: Number,
  participated_date: Number
});

UserSchema.index({userid: 1, participated_race: 1});
UserSchema.index({participated_date: -1});
UserSchema.index({userid: 1});
UserSchema.index({participated_date: 1});
UserSchema.index({ userid: 1, participated_race: 1, participated_horse: 1, participated_value: 1, participated_date: 1},{unique: 1})

mongoose.model('Users',UserSchema);
module.exports = mongoose.model('Users');
