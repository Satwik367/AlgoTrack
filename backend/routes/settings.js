const express = require("express");
const router = express.Router();
const UserSettings = require("../models/UserSettings");
 
router.get("/", async (req, res) => {
  try {
    let settings = await UserSettings.findOne();
    if (!settings) settings = await UserSettings.create({});
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
 
router.patch("/", async (req, res) => {
  try {
    let settings = await UserSettings.findOne();
    if (!settings) settings = new UserSettings();
    Object.assign(settings, req.body, { updatedAt: new Date() });
    await settings.save();
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
 
module.exports = router;