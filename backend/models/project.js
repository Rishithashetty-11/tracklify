const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
  projectTitle: { type: String, required: true },
  description: String,
  hourlyRate: Number,
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  freelancerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['pending', 'active', 'completed', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Project", projectSchema);