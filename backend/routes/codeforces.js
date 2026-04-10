const express = require("express");
const router = express.Router();
 
// GET user info + recent submissions
router.get("/user/:handle", async (req, res) => {
  try {
    const { handle } = req.params;
    const [userRes, subRes] = await Promise.all([
      fetch(`https://codeforces.com/api/user.info?handles=${handle}`),
      fetch(`https://codeforces.com/api/user.status?handle=${handle}&from=1&count=30`),
    ]);
    const userData = await userRes.json();
    const subData = await subRes.json();
 
    if (userData.status !== "OK") return res.status(404).json({ error: "Handle not found" });
 
    const user = userData.result[0];
    const submissions = subData.result || [];
 
    const solvedSet = new Set();
    const tagMap = {};
 
    submissions.forEach(s => {
      if (s.verdict === "OK") {
        const pid = `${s.problem.contestId}${s.problem.index}`;
        if (!solvedSet.has(pid)) {
          solvedSet.add(pid);
          (s.problem.tags || []).forEach(tag => {
            tagMap[tag] = (tagMap[tag] || 0) + 1;
          });
        }
      }
    });
 
    res.json({
      handle: user.handle,
      rating: user.rating || 0,
      maxRating: user.maxRating || 0,
      rank: user.rank || "unrated",
      maxRank: user.maxRank || "unrated",
      avatar: user.titlePhoto,
      recentSolved: solvedSet.size,
      topTags: Object.entries(tagMap).sort((a, b) => b[1] - a[1]).slice(0, 8),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
 
// GET contest history
router.get("/contests/:handle", async (req, res) => {
  try {
    const { handle } = req.params;
    const response = await fetch(`https://codeforces.com/api/user.rating?handle=${handle}`);
    const data = await response.json();
    if (data.status !== "OK") return res.status(404).json({ error: "No contest history" });
 
    const contests = data.result.slice(-10).map(c => ({
      contestName: c.contestName,
      rank: c.rank,
      ratingChange: c.newRating - c.oldRating,
      newRating: c.newRating,
      date: new Date(c.ratingUpdateTimeSeconds * 1000).toISOString().split("T")[0],
    }));
 
    res.json(contests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
 
module.exports = router;