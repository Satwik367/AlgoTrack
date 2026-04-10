const mongoose = require("mongoose");
 
const problemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  difficulty: { type: String, enum: ["Easy", "Medium", "Hard"], required: true },
  tag: { type: String, required: true },
  solved: { type: Boolean, default: false },
  link: { type: String, default: "" },
  notes: { type: String, default: "" },
  timeTaken: { type: Number, default: 0 }, // in minutes
  attempts: { type: Number, default: 1 },
  solvedAt: { type: Date, default: null },
  addedAt: { type: Date, default: Date.now },
  platform: { type: String, enum: ["LeetCode", "Codeforces", "GFG", "Other"], default: "Other" },
  rating: { type: Number, default: null }, // Codeforces rating
});
 
module.exports = mongoose.model("Problem", problemSchema);