const mongoose = require("mongoose");

const timeSchema = new mongoose.Schema({
  projectId: mongoose.Schema.Types.ObjectId,
  startTime: Date,
  endTime: Date,
  duration: Number
});

module.exports = mongoose.model("TimeLog", timeSchema);