import { cachedFetch } from "../utils/cache";
import { useState, useEffect } from "react";
import { api } from "../utils/api";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, Cell
} from "recharts";
import "./Analytics.css";
 
const TOOLTIP_STYLE = {
  contentStyle: { background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 },
  itemStyle: { color: "var(--text)" },
  labelStyle: { color: "var(--muted)" },
};
 
export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
 
  useEffect(() => {
    cachedFetch("analytics", api.getAnalytics).then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);
 
  if (loading) return <div className="loading">Loading analytics...</div>;
  if (!data) return <div className="loading">No analytics data available.</div>;
 
  const { byDifficulty, byTag, heatmap } = data;
 
  const diffData = Object.entries(byDifficulty || {}).map(([name, v]) => ({
    name, total: v.total, solved: v.solved, unsolved: v.total - v.solved
  }));
 
  const tagData = Object.entries(byTag || {})
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 10)
    .map(([name, v]) => ({ name, total: v.total, solved: v.solved, pct: Math.round((v.solved / v.total) * 100) }));
 
  // Heatmap — build last 12 weeks
  const heatmapCells = buildHeatmap(heatmap || {});
 
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Analytics</h1>
        <p className="page-subtitle">Deep dive into your performance</p>
      </div>
 
      <div className="analytics-grid">
        {/* Difficulty Chart */}
        <div className="card">
          <div className="section-title">By Difficulty</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={diffData} barSize={28}>
              <XAxis dataKey="name" tick={{ fill: "var(--muted)", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "var(--muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Bar dataKey="solved" name="Solved" radius={[4, 4, 0, 0]}>
                {diffData.map((entry) => (
                  <Cell key={entry.name} fill={
                    entry.name === "Easy" ? "#34d399" : entry.name === "Medium" ? "#fbbf24" : "#f87171"
                  } />
                ))}
              </Bar>
              <Bar dataKey="unsolved" name="Unsolved" radius={[4, 4, 0, 0]} fill="rgba(255,255,255,0.06)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
 
        {/* Topic Chart */}
        <div className="card">
          <div className="section-title">Top Topics</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={tagData} layout="vertical" barSize={10}>
              <XAxis type="number" tick={{ fill: "var(--muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" tick={{ fill: "var(--text)", fontSize: 11 }} axisLine={false} tickLine={false} width={90} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Bar dataKey="solved" name="Solved" fill="var(--accent)" radius={[0, 4, 4, 0]} />
              <Bar dataKey="total" name="Total" fill="rgba(255,255,255,0.06)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
 
        {/* Heatmap */}
        <div className="card" style={{ gridColumn: "1 / -1" }}>
          <div className="section-title">Activity Heatmap (Last 12 Weeks)</div>
          <HeatmapGrid cells={heatmapCells} />
        </div>
 
        {/* Topic Completion Table */}
        <div className="card" style={{ gridColumn: "1 / -1" }}>
          <div className="section-title">Topic Breakdown</div>
          <table className="topic-table">
            <thead>
              <tr>
                <th>Topic</th>
                <th>Total</th>
                <th>Solved</th>
                <th>Rate</th>
                <th>Status</th>
                <th>Progress</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(byTag || {}).sort((a, b) => b[1].total - a[1].total).map(([tag, v]) => {
                const pct = Math.round((v.solved / v.total) * 100);
                const isWeak = pct < 50 && v.total >= 2;
                return (
                  <tr key={tag}>
                    <td style={{ fontWeight: 500 }}>{tag}</td>
                    <td className="mono" style={{ color: "var(--muted)" }}>{v.total}</td>
                    <td className="mono" style={{ color: "var(--green)" }}>{v.solved}</td>
                    <td className="mono">{pct}%</td>
                    <td>
                      <span className={`status-badge ${isWeak ? "weak" : "strong"}`}>
                        {isWeak ? "Needs work" : "Good"}
                      </span>
                    </td>
                    <td style={{ width: 120 }}>
                      <div style={{ background: "var(--bg3)", borderRadius: 20, height: 5, overflow: "hidden" }}>
                        <div style={{ width: `${pct}%`, height: "100%", background: isWeak ? "var(--red)" : "var(--green)", borderRadius: 20, transition: "width 0.5s" }} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
 
function HeatmapGrid({ cells }) {
  const days = ["", "Mon", "", "Wed", "", "Fri", ""];
  return (
    <div className="heatmap-wrap">
      <div className="heatmap-days">
        {days.map((d, i) => <div key={i} className="heatmap-day-label">{d}</div>)}
      </div>
      <div className="heatmap-grid">
        {cells.map((cell, i) => (
          <div
            key={i}
            className="heatmap-cell"
            title={cell.date ? `${cell.date}: ${cell.count} solved` : ""}
            style={{ background: getHeatColor(cell.count) }}
          />
        ))}
      </div>
      <div className="heatmap-legend">
        <span style={{ color: "var(--muted)", fontSize: 11 }}>Less</span>
        {[0, 1, 2, 3, 4].map(v => (
          <div key={v} className="heatmap-cell" style={{ background: getHeatColor(v) }} />
        ))}
        <span style={{ color: "var(--muted)", fontSize: 11 }}>More</span>
      </div>
    </div>
  );
}
 
function getHeatColor(count) {
  if (!count) return "rgba(255,255,255,0.05)";
  if (count === 1) return "rgba(56,189,248,0.25)";
  if (count === 2) return "rgba(56,189,248,0.45)";
  if (count === 3) return "rgba(56,189,248,0.65)";
  return "rgba(56,189,248,0.9)";
}
 
function buildHeatmap(heatmap) {
  const cells = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(today);
  start.setDate(today.getDate() - 83); // 12 weeks back
 
  // pad to start of week
  const dayOfWeek = start.getDay();
  start.setDate(start.getDate() - dayOfWeek);
 
  for (let d = new Date(start); d <= today; d.setDate(d.getDate() + 1)) {
    const key = d.toISOString().split("T")[0];
    cells.push({ date: key, count: heatmap[key] || 0 });
  }
  return cells;
}