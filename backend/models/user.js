const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  role: { type: String, enum: ['freelancer', 'client'], default: 'freelancer' },
  skills: { type: [String], default: [] },
  bio: { type: String, default: "" }
});

module.exports = mongoose.model("User", userSchema);