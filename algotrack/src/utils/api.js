const BASE = "http://localhost:5000/api";
 
export const api = {
  getProblems: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return fetch(`${BASE}/problems${q ? "?" + q : ""}`).then(r => r.json());
  },
  addProblem: (data) => fetch(`${BASE}/problems`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then(r => r.json()),
  updateProblem: (id, data) => fetch(`${BASE}/problems/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then(r => r.json()),
  deleteProblem: (id) => fetch(`${BASE}/problems/${id}`, { method: "DELETE" }).then(r => r.json()),
  getAnalytics: () => fetch(`${BASE}/problems/analytics/summary`).then(r => r.json()),
  getCFUser: (handle) => fetch(`${BASE}/codeforces/user/${handle}`).then(r => r.json()),
  getCFContests: (handle) => fetch(`${BASE}/codeforces/contests/${handle}`).then(r => r.json()),
  getSettings: () => fetch(`${BASE}/settings`).then(r => r.json()),
  updateSettings: (data) => fetch(`${BASE}/settings`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then(r => r.json()),
};
 