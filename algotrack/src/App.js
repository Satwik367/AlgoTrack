import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Problems from "./pages/Problems";
import Analytics from "./pages/Analytics";
import Codeforces from "./pages/Codeforces";
import "./App.css";
 
function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/problems" element={<Problems />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/codeforces" element={<Codeforces />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
 
function Sidebar() {
  const links = [
    { to: "/", label: "Dashboard", icon: "⬡" },
    { to: "/problems", label: "Problems", icon: "◈" },
    { to: "/analytics", label: "Analytics", icon: "◉" },
    { to: "/codeforces", label: "Codeforces", icon: "⬟" },
  ];
  return (
    <nav className="sidebar">
      <div className="sidebar-logo">
        <span className="logo-icon">⬡</span>
        <span className="logo-text">AlgoTrack</span>
      </div>
      <ul className="sidebar-links">
        {links.map(l => (
          <li key={l.to}>
            <NavLink to={l.to} end={l.to === "/"} className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
              <span className="nav-icon">{l.icon}</span>
              <span>{l.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
      <div className="sidebar-footer">
        <span className="mono" style={{ color: "var(--muted)", fontSize: 11 }}>v2.0.0</span>
      </div>
    </nav>
  );
}
 
export default App;