import { useState, useEffect } from "react";
import { api } from "../utils/api";
import { RadialBarChart, RadialBar, ResponsiveContainer, Tooltip } from "recharts";
import "./Dashboard.css";
 
export default function Dashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
 
  useEffect(() => {
    api.getAnalytics().then(data => {
      setAnalytics(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);
 
  if (loading) return <div className="loading">Loading dashboard...</div>;
  if (!analytics) return <div className="loading">Could not load data. Is the backend running?</div>;
 
  const { total, solved, byDifficulty, byTag } = analytics;
  const solveRate = total > 0 ? Math.round((solved / total) * 100) : 0;
 
  const weakTopics = Object.entries(byTag || {})
    .filter(([, v]) => v.total >= 2 && v.solved / v.total < 0.5)
    .sort((a, b) => (a[1].solved / a[1].total) - (b[1].solved / b[1].total))
    .slice(0, 4);
 
  const strongTopics = Object.entries(byTag || {})
    .filter(([, v]) => v.total >= 2 && v.solved / v.total >= 0.5)
    .sort((a, b) => (b[1].solved / b[1].total) - (a[1].solved / a[1].total))
    .slice(0, 4);
 
  const radialData = [
    { name: "Hard", value: byDifficulty?.Hard?.solved || 0, fill: "#f87171" },
    { name: "Medium", value: byDifficulty?.Medium?.solved || 0, fill: "#fbbf24" },
    { name: "Easy", value: byDifficulty?.Easy?.solved || 0, fill: "#34d399" },
  ];
 
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Your DSA progress at a glance</p>
      </div>
 
      {/* Stats Row */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label">Total Problems</div>
          <div className="stat-value">{total}</div>
          <div className="stat-sub">in your tracker</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Solved</div>
          <div className="stat-value" style={{ color: "var(--green)" }}>{solved}</div>
          <div className="stat-sub">{solveRate}% completion</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Easy</div>
          <div className="stat-value" style={{ color: "var(--easy)" }}>
            {byDifficulty?.Easy?.solved || 0}
          </div>
          <div className="stat-sub">of {byDifficulty?.Easy?.total || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Medium</div>
          <div className="stat-value" style={{ color: "var(--medium)" }}>
            {byDifficulty?.Medium?.solved || 0}
          </div>
          <div className="stat-sub">of {byDifficulty?.Medium?.total || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Hard</div>
          <div className="stat-value" style={{ color: "var(--hard)" }}>
            {byDifficulty?.Hard?.solved || 0}
          </div>
          <div className="stat-sub">of {byDifficulty?.Hard?.total || 0}</div>
        </div>
      </div>
 
      <div className="dashboard-grid">
        {/* Progress Chart */}
        <div className="card">
          <div className="section-title">Solve Distribution</div>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <ResponsiveContainer width={160} height={160}>
              <RadialBarChart innerRadius={30} outerRadius={70} data={radialData} startAngle={90} endAngle={-270}>
                <RadialBar dataKey="value" cornerRadius={4} />
                <Tooltip
                  contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
                  itemStyle={{ color: "var(--text)" }}
                />
              </RadialBarChart>
            </ResponsiveContainer>
            <div style={{ flex: 1 }}>
              {radialData.map(d => (
                <div key={d.name} className="radial-legend-row" style={{ marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 13, color: d.fill }}>{d.name}</span>
                    <span className="mono" style={{ fontSize: 13 }}>{d.value}</span>
                  </div>
                  <div className="progress-bar-bg">
                    <div className="progress-bar-fill" style={{
                      width: total > 0 ? `${(d.value / (byDifficulty?.[d.name]?.total || 1)) * 100}%` : "0%",
                      background: d.fill
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
 
        {/* Weak Areas */}
        <div className="card">
          <div className="section-title">Weak Areas ⚠</div>
          {weakTopics.length === 0 ? (
            <p style={{ color: "var(--muted)", fontSize: 13 }}>No weak topics found — great work!</p>
          ) : (
            weakTopics.map(([tag, data]) => (
              <TopicRow key={tag} tag={tag} data={data} color="var(--red)" />
            ))
          )}
        </div>
 
        {/* Strong Areas */}
        <div className="card">
          <div className="section-title">Strong Areas ✓</div>
          {strongTopics.length === 0 ? (
            <p style={{ color: "var(--muted)", fontSize: 13 }}>Solve more problems to see your strengths.</p>
          ) : (
            strongTopics.map(([tag, data]) => (
              <TopicRow key={tag} tag={tag} data={data} color="var(--green)" />
            ))
          )}
        </div>
 
        {/* All Topics */}
        <div className="card">
          <div className="section-title">All Topics</div>
          <div className="topic-grid">
            {Object.entries(byTag || {}).map(([tag, data]) => {
              const pct = Math.round((data.solved / data.total) * 100);
              return (
                <div key={tag} className="topic-chip">
                  <span className="topic-chip-name">{tag}</span>
                  <span className="topic-chip-count mono">{data.solved}/{data.total}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
 
function TopicRow({ tag, data, color }) {
  const pct = Math.round((data.solved / data.total) * 100);
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
        <span style={{ fontSize: 13 }}>{tag}</span>
        <span className="mono" style={{ fontSize: 12, color }}>{pct}%</span>
      </div>
      <div className="progress-bar-bg">
        <div className="progress-bar-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 3 }}>{data.solved}/{data.total} solved</div>
    </div>
  );
}