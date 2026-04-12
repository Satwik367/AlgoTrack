const express = require("express");
const router = express.Router();
const Problem = require("../models/Problem");
 
// GET all problems
router.get("/", async (req, res) => {
  try {
    const { difficulty, tag, solved } = req.query;
    const filter = {};
    if (difficulty) filter.difficulty = difficulty;
    if (tag) filter.tag = tag;
    if (solved !== undefined) filter.solved = solved === "true";
    const problems = await Problem.find(filter).sort({ addedAt: -1 });
    res.json(problems);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
 
// POST add problem
router.post("/", async (req, res) => {
  try {
    const problem = new Problem(req.body);
    await problem.save();
    res.status(201).json(problem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
 
// PATCH update problem (solved toggle, notes, etc.)
router.patch("/:id", async (req, res) => {
  try {
    const update = { ...req.body };
    if (update.solved === true && !update.solvedAt) {
      update.solvedAt = new Date();
    }
    const problem = await Problem.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json(problem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
 
// DELETE problem
router.delete("/:id", async (req, res) => {
  try {
    await Problem.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
 
// GET analytics
router.get("/analytics/summary", async (req, res) => {
  try {
    const problems = await Problem.find();
    const total = problems.length;
    const solved = problems.filter(p => p.solved).length;
 
    const byDifficulty = { Easy: { total: 0, solved: 0 }, Medium: { total: 0, solved: 0 }, Hard: { total: 0, solved: 0 } };
    const byTag = {};
    const heatmap = {};
 
    problems.forEach(p => {
      byDifficulty[p.difficulty].total++;
      if (p.solved) byDifficulty[p.difficulty].solved++;
 
      if (!byTag[p.tag]) byTag[p.tag] = { total: 0, solved: 0 };
      byTag[p.tag].total++;
      if (p.solved) byTag[p.tag].solved++;
 
      if (p.solvedAt) {
        const day = new Date(p.solvedAt).toISOString().split("T")[0];
        heatmap[day] = (heatmap[day] || 0) + 1;
      }
    });
 
    res.json({ total, solved, byDifficulty, byTag, heatmap });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST bulk import problems
router.post("/import", async (req, res) => {
  try {
    const { problems } = req.body;
    if (!problems || !problems.length) return res.status(400).json({ error: "No problems provided" });

    // get existing problem names to avoid duplicates
    const existing = await Problem.find({ platform: "Codeforces" }).select("name");
    const existingNames = new Set(existing.map(p => p.name));

    const newProblems = problems.filter(p => !existingNames.has(p.name));

    if (newProblems.length === 0) return res.json({ imported: 0, message: "No new problems to import" });

    await Problem.insertMany(newProblems);
    res.json({ imported: newProblems.length, message: `Imported ${newProblems.length} problems` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
 
module.exports = router;