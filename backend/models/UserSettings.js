const mongoose = require("mongoose");
 
const userSettingsSchema = new mongoose.Schema({
  codeforcesHandle: { type: String, default: "" },
  dailyGoal: { type: Number, default: 3 },
  updatedAt: { type: Date, default: Date.now },
});
 
module.exports = mongoose.model("UserSettings", userSettingsSchema);