const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema({
  day: String,
  subjects: [{
    time: String,
    subject: String,
  }],
});

module.exports = mongoose.model('Timetable', timetableSchema);