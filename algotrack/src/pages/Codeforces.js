import { useState, useEffect } from "react";
import { api } from "../utils/api";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import "./Codeforces.css";

const TOOLTIP_STYLE = {
  contentStyle: { background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 },
  itemStyle: { color: "var(--text)" },
  labelStyle: { color: "var(--muted)" },
};

export default function Codeforces() {
  const [handle, setHandle] = useState("");
  const [savedHandle, setSavedHandle] = useState("");
  const [user, setUser] = useState(null);
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // import states
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [importing, setImporting] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [importResult, setImportResult] = useState(null);

  // recommendation states
  const [recommendations, setRecommendations] = useState([]);
  const [recLoading, setRecLoading] = useState(false);
  const [weakTags, setWeakTags] = useState([]);
  const [userRating, setUserRating] = useState(null);

  useEffect(() => {
    api.getSettings().then(s => {
      if (s.codeforcesHandle) {
        setSavedHandle(s.codeforcesHandle);
        setHandle(s.codeforcesHandle);
        fetchData(s.codeforcesHandle);
      }
    });
  }, []);

  const fetchData = async (h) => {
    const target = h || handle;
    if (!target) return;
    setLoading(true);
    setError("");
    try {
      const [userData, contestData] = await Promise.all([
        api.getCFUser(target),
        api.getCFContests(target),
      ]);
      if (userData.error) throw new Error(userData.error);
      setUser(userData);
      setContests(Array.isArray(contestData) ? contestData : []);
      await api.updateSettings({ codeforcesHandle: target });
      setSavedHandle(target);
    } catch (err) {
      setError("Could not fetch data. Check the handle and make sure backend is running.");
    }
    setLoading(false);
  };

  const fetchSolvedProblems = async () => {
    setImportLoading(true);
    setImportResult(null);
    try {
      const data = await api.getCFSolved(savedHandle);
      if (data.error) throw new Error(data.error);
      setSolvedProblems(data);
      setImporting(true);
    } catch (err) {
      setError("Could not fetch solved problems.");
    }
    setImportLoading(false);
  };

  const handleImport = async () => {
    setImportLoading(true);
    try {
      const result = await api.bulkImport(solvedProblems);
      setImportResult(result);
      setImporting(false);
      setSolvedProblems([]);
    } catch (err) {
      setError("Import failed. Try again.");
    }
    setImportLoading(false);
  };

  const fetchRecommendations = async () => {
    setRecLoading(true);
    try {
      const data = await api.getCFRecommendations(savedHandle);
      if (data.error) throw new Error(data.error);
      setRecommendations(data.recommendations || []);
      setWeakTags(data.weakTags || []);
      setUserRating(data.userRating || null);
    } catch (err) {
      setError("Could not fetch recommendations.");
    }
    setRecLoading(false);
  };

  const getRankColor = (rank) => {
    if (!rank) return "var(--muted)";
    if (rank.includes("grandmaster")) return "#f87171";
    if (rank.includes("master")) return "#fbbf24";
    if (rank.includes("expert")) return "#818cf8";
    if (rank.includes("specialist")) return "#34d399";
    return "var(--muted)";
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Codeforces</h1>
        <p className="page-subtitle">Connect your profile for contest tracking and problem import</p>
      </div>

      {/* Handle Input */}
      <div className="card cf-connect-card">
        <div className="section-title">Your Handle</div>
        <div className="cf-input-row">
          <input
            placeholder="e.g. tourist"
            value={handle}
            onChange={e => setHandle(e.target.value)}
            onKeyDown={e => e.key === "Enter" && fetchData()}
            style={{ maxWidth: 280 }}
          />
          <button className="btn-primary" onClick={() => fetchData()} disabled={loading}>
            {loading ? "Loading..." : savedHandle ? "Refresh" : "Connect"}
          </button>
        </div>
        {error && <p className="cf-error">{error}</p>}
      </div>

      {user && (
        <div className="cf-grid">
          {/* Profile Card */}
          <div className="card cf-profile-card">
            <div className="cf-avatar-row">
              <img src={user.avatar} alt={user.handle} className="cf-avatar" />
              <div>
                <div className="cf-handle">{user.handle}</div>
                <div className="cf-rank" style={{ color: getRankColor(user.rank) }}>
                  {user.rank || "unrated"}
                </div>
              </div>
            </div>
            <div className="cf-stats-row">
              <div className="cf-stat">
                <div className="stat-label">Current Rating</div>
                <div className="stat-value mono" style={{ fontSize: 22, color: getRankColor(user.rank) }}>
                  {user.rating || "—"}
                </div>
              </div>
              <div className="cf-stat">
                <div className="stat-label">Max Rating</div>
                <div className="stat-value mono" style={{ fontSize: 22 }}>{user.maxRating || "—"}</div>
                <div className="stat-sub" style={{ color: getRankColor(user.maxRank) }}>{user.maxRank}</div>
              </div>
              <div className="cf-stat">
                <div className="stat-label">Recent Solved</div>
                <div className="stat-value mono" style={{ fontSize: 22, color: "var(--green)" }}>{user.recentSolved}</div>
                <div className="stat-sub">last 30 problems</div>
              </div>
            </div>
          </div>

          {/* Top Tags */}
          <div className="card">
            <div className="section-title">Recent Problem Tags</div>
            <div className="cf-tags">
              {(user.topTags || []).map(([tag, count]) => (
                <div key={tag} className="cf-tag-row">
                  <span className="cf-tag-name">{tag}</span>
                  <div style={{ flex: 1, background: "var(--bg3)", borderRadius: 20, height: 5, overflow: "hidden" }}>
                    <div style={{
                      width: `${Math.min((count / (user.topTags[0]?.[1] || 1)) * 100, 100)}%`,
                      height: "100%", background: "var(--accent2)", borderRadius: 20,
                    }} />
                  </div>
                  <span className="mono" style={{ fontSize: 12, color: "var(--muted)", minWidth: 24, textAlign: "right" }}>{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Import Section */}
          <div className="card" style={{ gridColumn: "1 / -1" }}>
            <div className="section-title">Import Solved Problems</div>
            {!importing ? (
              <div className="import-section">
                <p style={{ color: "var(--muted)", fontSize: 13, marginBottom: 14 }}>
                  Automatically import all your solved Codeforces problems into your tracker.
                  Duplicates will be skipped.
                </p>
                {importResult && (
                  <div className="import-result">
                    ✅ Successfully imported <strong>{importResult.imported}</strong> new problems!
                  </div>
                )}
                <button className="btn-primary" onClick={fetchSolvedProblems} disabled={importLoading}>
                  {importLoading ? "Fetching problems..." : "Preview Solved Problems"}
                </button>
              </div>
            ) : (
              <div className="import-preview">
                <div className="import-preview-header">
                  <p style={{ color: "var(--text)", fontSize: 13 }}>
                    Found <strong style={{ color: "var(--accent)" }}>{solvedProblems.length}</strong> solved problems to import
                  </p>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn-primary" onClick={handleImport} disabled={importLoading}>
                      {importLoading ? "Importing..." : `Import All ${solvedProblems.length} Problems`}
                    </button>
                    <button className="btn-ghost" onClick={() => { setImporting(false); setSolvedProblems([]); }}>
                      Cancel
                    </button>
                  </div>
                </div>
                <div className="import-preview-list">
                  {solvedProblems.slice(0, 10).map((p, i) => (
                    <div key={i} className="import-preview-row">
                      <a href={p.link} target="_blank" rel="noopener noreferrer" className="problem-link">{p.name}</a>
                      <span className={`diff-badge diff-${p.difficulty?.toLowerCase()}`}>{p.difficulty}</span>
                      <span className="tag-pill">{p.tag}</span>
                      {p.rating && <span className="mono" style={{ fontSize: 12, color: "var(--muted)" }}>{p.rating}</span>}
                    </div>
                  ))}
                  {solvedProblems.length > 10 && (
                    <p style={{ color: "var(--muted)", fontSize: 12, padding: "8px 0" }}>
                      ...and {solvedProblems.length - 10} more
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Recommendations Section */}
          <div className="card" style={{ gridColumn: "1 / -1" }}>
            <div className="section-title">Problem Recommendations</div>
            {recommendations.length === 0 ? (
              <div className="rec-empty">
                <p style={{ color: "var(--muted)", fontSize: 13, marginBottom: 14 }}>
                  Get personalized problem recommendations based on your weak topics and current rating.
                </p>
                <button className="btn-primary" onClick={fetchRecommendations} disabled={recLoading}>
                  {recLoading ? "Finding recommendations..." : "Get Recommendations"}
                </button>
              </div>
            ) : (
              <div>
                <div className="rec-meta">
                  <span>Based on rating <strong style={{ color: "var(--accent)" }}>{userRating}</strong></span>
                  <span>Weak tags: {weakTags.slice(0, 4).map(t => (
                    <span key={t} className="tag-pill" style={{ marginLeft: 4 }}>{t}</span>
                  ))}</span>
                  <button className="btn-ghost" style={{ fontSize: 12, padding: "4px 10px" }} onClick={fetchRecommendations}>
                    Refresh
                  </button>
                </div>
                <div className="rec-list">
                  {recommendations.map((p, i) => (
                    <div key={i} className="rec-row">
                      <span className="mono" style={{ color: "var(--muted)", fontSize: 12, minWidth: 20 }}>{i + 1}</span>
                      <a href={p.link} target="_blank" rel="noopener noreferrer" className="problem-link rec-name">{p.name}</a>
                      <span className={`diff-badge diff-${p.difficulty?.toLowerCase()}`}>{p.difficulty}</span>
                      <span className="mono" style={{ fontSize: 12, color: "var(--muted)" }}>{p.rating}</span>
                      <div className="rec-tags">
                        {p.tags.slice(0, 3).map(t => (
                          <span key={t} className="tag-pill">{t}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Rating History */}
          {contests.length > 0 && (
            <div className="card" style={{ gridColumn: "1 / -1" }}>
              <div className="section-title">Rating History (Last 10 Contests)</div>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={contests} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" tick={{ fill: "var(--muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "var(--muted)", fontSize: 11 }} axisLine={false} tickLine={false} domain={["auto", "auto"]} />
                  <Tooltip {...TOOLTIP_STYLE} />
                  <Line type="monotone" dataKey="newRating" stroke="var(--accent)" strokeWidth={2} dot={{ fill: "var(--accent)", r: 4 }} name="Rating" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Contest Table */}
          {contests.length > 0 && (
            <div className="card" style={{ gridColumn: "1 / -1" }}>
              <div className="section-title">Contest History</div>
              <table className="cf-table">
                <thead>
                  <tr>
                    <th>Contest</th>
                    <th>Date</th>
                    <th>Rank</th>
                    <th>Rating Change</th>
                    <th>New Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {[...contests].reverse().map((c, i) => (
                    <tr key={i}>
                      <td style={{ maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.contestName}</td>
                      <td style={{ color: "var(--muted)" }}>{c.date}</td>
                      <td className="mono">#{c.rank}</td>
                      <td className="mono" style={{ color: c.ratingChange >= 0 ? "var(--green)" : "var(--red)" }}>
                        {c.ratingChange >= 0 ? "+" : ""}{c.ratingChange}
                      </td>
                      <td className="mono">{c.newRating}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {!user && !loading && (
        <div className="cf-empty">
          <div className="cf-empty-icon">⬟</div>
          <p>Enter your Codeforces handle above to see your profile, import solved problems, and get recommendations.</p>
        </div>
      )}
    </div>
  );
}