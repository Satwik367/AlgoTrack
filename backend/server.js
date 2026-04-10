const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
 
const problemsRouter = require("./routes/problems");
const codeforcesRouter = require("./routes/codeforces");
const settingsRouter = require("./routes/settings");
 
const app = express();
 
app.use(cors());
app.use(express.json());
 
// ⚠️ Replace with your MongoDB URI (use .env in production)
const MONGO_URI = "mongodb+srv://satwikmaiti:kiwtas1234@cluster0.phnn7lt.mongodb.net/algotrack?retryWrites=true&w=majority";
 
mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ DB Connected"))
  .catch(err => console.log("❌ DB Error:", err));
 
app.get("/", (req, res) => res.send("AlgoTrack API 🚀"));
 
app.use("/api/problems", problemsRouter);
app.use("/api/codeforces", codeforcesRouter);
app.use("/api/settings", settingsRouter);
 
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));