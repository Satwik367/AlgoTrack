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

// GET all solved problems for import
router.get("/solved/:handle", async (req, res) => {
  try {
    const { handle } = req.params;
    const response = await fetch(`https://codeforces.com/api/user.status?handle=${handle}&from=1&count=1000`);
    const data = await response.json();
    if (data.status !== "OK") return res.status(404).json({ error: "Handle not found" });

    const solvedMap = new Map();

    data.result.forEach(s => {
      if (s.verdict === "OK") {
        const pid = `${s.problem.contestId}${s.problem.index}`;
        if (!solvedMap.has(pid)) {
          solvedMap.set(pid, {
            name: s.problem.name,
            rating: s.problem.rating || null,
            tags: s.problem.tags || [],
            contestId: s.problem.contestId,
            index: s.problem.index,
            solvedAt: new Date(s.creationTimeSeconds * 1000),
            link: `https://codeforces.com/contest/${s.problem.contestId}/problem/${s.problem.index}`,
          });
        }
      }
    });

    const problems = Array.from(solvedMap.values()).map(p => ({
      name: p.name,
      difficulty: mapDifficulty(p.rating),
      tag: mapTag(p.tags),
      link: p.link,
      solved: true,
      solvedAt: p.solvedAt,
      platform: "Codeforces",
      rating: p.rating,
    }));

    res.json(problems);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET problem recommendations
router.get("/recommendations/:handle", async (req, res) => {
  try {
    const { handle } = req.params;

    // fetch user rating and solved problems
    const [userRes, solvedRes, problemsRes] = await Promise.all([
      fetch(`https://codeforces.com/api/user.info?handles=${handle}`),
      fetch(`https://codeforces.com/api/user.status?handle=${handle}&from=1&count=1000`),
      fetch(`https://codeforces.com/api/problemset.problems`),
    ]);

    const userData = await userRes.json();
    const solvedData = await solvedRes.json();
    const problemsData = await problemsRes.json();

    if (userData.status !== "OK") return res.status(404).json({ error: "Handle not found" });

    const userRating = userData.result[0].rating || 1200;

    // build solved set
    const solvedSet = new Set();
    const tagCount = {};
    solvedData.result.forEach(s => {
      if (s.verdict === "OK") {
        solvedSet.add(`${s.problem.contestId}${s.problem.index}`);
        (s.problem.tags || []).forEach(tag => {
          tagCount[tag] = (tagCount[tag] || 0) + 1;
        });
      }
    });

    // find weak tags (least solved)
    const weakTags = Object.entries(tagCount)
      .sort((a, b) => a[1] - b[1])
      .slice(0, 5)
      .map(([tag]) => tag);

    // find unsolved problems slightly above user rating
    const targetMin = userRating;
    const targetMax = userRating + 300;

    const recommendations = problemsData.result.problems
      .filter(p => {
        const pid = `${p.contestId}${p.index}`;
        const inRatingRange = p.rating >= targetMin && p.rating <= targetMax;
        const notSolved = !solvedSet.has(pid);
        const hasWeakTag = (p.tags || []).some(t => weakTags.includes(t));
        return inRatingRange && notSolved && hasWeakTag && p.rating;
      })
      .slice(0, 10)
      .map(p => ({
        name: p.name,
        rating: p.rating,
        tags: p.tags,
        link: `https://codeforces.com/contest/${p.contestId}/problem/${p.index}`,
        difficulty: mapDifficulty(p.rating),
      }));

    res.json({ weakTags, userRating, recommendations });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function mapDifficulty(rating) {
  if (!rating) return "Medium";
  if (rating < 1200) return "Easy";
  if (rating <= 1800) return "Medium";
  return "Hard";
}

function mapTag(tags) {
  if (!tags || tags.length === 0) return "Other";
  const tagMap = {
    "dp": "DP",
    "dynamic programming": "DP",
    "graphs": "Graph",
    "graph": "Graph",
    "trees": "Tree",
    "tree": "Tree",
    "binary search": "Binary Search",
    "greedy": "Greedy",
    "math": "Math",
    "strings": "String",
    "string": "String",
    "two pointers": "Two Pointers",
    "sorting": "Array",
    "arrays": "Array",
  };
  for (const tag of tags) {
    const mapped = tagMap[tag.toLowerCase()];
    if (mapped) return mapped;
  }
  return tags[0] || "Other";
}

module.exports = router;