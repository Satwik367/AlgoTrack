import { useState, useEffect } from "react";
import { api } from "../utils/api";
import "./Problems.css";
 
const TAGS = ["Array", "String", "DP", "Graph", "Tree", "Binary Search", "Greedy", "Math", "Stack", "Queue", "Heap", "Backtracking", "Two Pointers", "Sliding Window", "Trie", "Other"];
const DIFFICULTIES = ["Easy", "Medium", "Hard"];
const PLATFORMS = ["LeetCode", "Codeforces", "GFG", "Other"];
 
export default function Problems() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState({ difficulty: "", tag: "", search: "" });
  const [editNotes, setEditNotes] = useState(null);
  const [form, setForm] = useState({ name: "", difficulty: "Medium", tag: "Array", link: "", platform: "LeetCode", timeTaken: "", notes: "" });
 
  useEffect(() => { load(); }, []);
 
  const load = () => {
    api.getProblems().then(data => {
      setProblems(Array.isArray(data) ? data : []);
      setLoading(false);
    });
  };
 
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.name) return;
    const newP = await api.addProblem({ ...form, timeTaken: Number(form.timeTaken) || 0 });
    setProblems(prev => [newP, ...prev]);
    setForm({ name: "", difficulty: "Medium", tag: "Array", link: "", platform: "LeetCode", timeTaken: "", notes: "" });
    setShowForm(false);
  };
 
  const toggleSolved = async (p) => {
    const updated = await api.updateProblem(p._id, { solved: !p.solved });
    setProblems(prev => prev.map(x => x._id === p._id ? updated : x));
  };
 
  const handleDelete = async (id) => {
    await api.deleteProblem(id);
    setProblems(prev => prev.filter(p => p._id !== id));
  };
 
  const saveNotes = async (p, notes) => {
    const updated = await api.updateProblem(p._id, { notes });
    setProblems(prev => prev.map(x => x._id === p._id ? updated : x));
    setEditNotes(null);
  };
 
  const filtered = problems.filter(p => {
    if (filter.difficulty && p.difficulty !== filter.difficulty) return false;
    if (filter.tag && p.tag !== filter.tag) return false;
    if (filter.search && !p.name.toLowerCase().includes(filter.search.toLowerCase())) return false;
    return true;
  });
 
  return (
    <div>
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 className="page-title">Problems</h1>
          <p className="page-subtitle">{problems.length} tracked · {problems.filter(p => p.solved).length} solved</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? "✕ Cancel" : "+ Add Problem"}
        </button>
      </div>
 
      {/* Add Form */}
      {showForm && (
        <div className="card add-form" style={{ marginBottom: 20 }}>
          <div className="section-title">New Problem</div>
          <form onSubmit={handleAdd} className="problem-form">
            <input placeholder="Problem name *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            <select value={form.difficulty} onChange={e => setForm({ ...form, difficulty: e.target.value })}>
              {DIFFICULTIES.map(d => <option key={d}>{d}</option>)}
            </select>
            <select value={form.tag} onChange={e => setForm({ ...form, tag: e.target.value })}>
              {TAGS.map(t => <option key={t}>{t}</option>)}
            </select>
            <select value={form.platform} onChange={e => setForm({ ...form, platform: e.target.value })}>
              {PLATFORMS.map(p => <option key={p}>{p}</option>)}
            </select>
            <input placeholder="Link (optional)" value={form.link} onChange={e => setForm({ ...form, link: e.target.value })} />
            <input type="number" placeholder="Time taken (min)" value={form.timeTaken} onChange={e => setForm({ ...form, timeTaken: e.target.value })} />
            <textarea placeholder="Notes (optional)" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} style={{ gridColumn: "1 / -1" }} />
            <button type="submit" className="btn-primary" style={{ gridColumn: "1 / -1" }}>Add Problem</button>
          </form>
        </div>
      )}
 
      {/* Filters */}
      <div className="filters-bar">
        <input placeholder="Search problems..." value={filter.search} onChange={e => setFilter({ ...filter, search: e.target.value })} style={{ maxWidth: 220 }} />
        <select value={filter.difficulty} onChange={e => setFilter({ ...filter, difficulty: e.target.value })}>
          <option value="">All Difficulties</option>
          {DIFFICULTIES.map(d => <option key={d}>{d}</option>)}
        </select>
        <select value={filter.tag} onChange={e => setFilter({ ...filter, tag: e.target.value })}>
          <option value="">All Topics</option>
          {TAGS.map(t => <option key={t}>{t}</option>)}
        </select>
        {(filter.difficulty || filter.tag || filter.search) && (
          <button className="btn-ghost" onClick={() => setFilter({ difficulty: "", tag: "", search: "" })}>Clear</button>
        )}
        <span style={{ marginLeft: "auto", color: "var(--muted)", fontSize: 13 }}>{filtered.length} problems</span>
      </div>
 
      {/* Problem List */}
      {loading ? <div className="loading">Loading...</div> : (
        <div className="problems-list">
          {filtered.length === 0 ? (
            <div className="empty-state">No problems match your filters.</div>
          ) : filtered.map((p, i) => (
            <div key={p._id} className={`problem-row ${p.solved ? "solved" : ""}`}>
              <div className="problem-left">
                <button
                  className={`check-btn ${p.solved ? "checked" : ""}`}
                  onClick={() => toggleSolved(p)}
                  title={p.solved ? "Mark unsolved" : "Mark solved"}
                >
                  {p.solved ? "✓" : "○"}
                </button>
                <div>
                  <div className="problem-name">
                    {p.link ? (
                      <a href={p.link} target="_blank" rel="noopener noreferrer" className="problem-link">{p.name}</a>
                    ) : p.name}
                  </div>
                  <div className="problem-meta">
                    <span className={`diff-badge diff-${p.difficulty?.toLowerCase()}`}>{p.difficulty}</span>
                    <span className="tag-pill">{p.tag}</span>
                    <span className="platform-pill">{p.platform}</span>
                    {p.timeTaken > 0 && <span style={{ color: "var(--muted)", fontSize: 12 }}>⏱ {p.timeTaken}m</span>}
                    {p.solvedAt && <span style={{ color: "var(--muted)", fontSize: 12 }}>{new Date(p.solvedAt).toLocaleDateString()}</span>}
                  </div>
                  {editNotes === p._id ? (
                    <NoteEditor problem={p} onSave={(notes) => saveNotes(p, notes)} onCancel={() => setEditNotes(null)} />
                  ) : p.notes ? (
                    <div className="problem-notes" onClick={() => setEditNotes(p._id)}>📝 {p.notes}</div>
                  ) : null}
                </div>
              </div>
              <div className="problem-actions">
                <button className="btn-ghost" style={{ fontSize: 12, padding: "5px 10px" }} onClick={() => setEditNotes(editNotes === p._id ? null : p._id)}>Notes</button>
                <button className="btn-danger" onClick={() => handleDelete(p._id)}>✕</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
 
function NoteEditor({ problem, onSave, onCancel }) {
  const [text, setText] = useState(problem.notes || "");
  return (
    <div style={{ marginTop: 8 }}>
      <textarea value={text} onChange={e => setText(e.target.value)} rows={2} style={{ fontSize: 13 }} />
      <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
        <button className="btn-primary" style={{ fontSize: 12, padding: "5px 12px" }} onClick={() => onSave(text)}>Save</button>
        <button className="btn-ghost" style={{ fontSize: 12, padding: "5px 12px" }} onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}