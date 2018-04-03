var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ParticipatedSchema = new Schema({
  participated_userid: String,
  participated_race: String,
  participated_date: Number
});

ParticipatedSchema.index({participated_userid: 1, participated_race: 1},{unique: 1});
ParticipatedSchema.index({participated_date: -1});
ParticipatedSchema.index({participated_userid: 1});
ParticipatedSchema.index({participated_date: 1});

mongoose.model('Participatedrace',ParticipatedSchema);
module.exports = mongoose.model('Participatedrace');
