import React from "react";

function Navbar({ activeView, setActiveView, onResetToHero }) {
  return (
    <header className="navbar">
      <div className="nav-container">
        <div
          className="nav-brand"
          onClick={onResetToHero}
          style={{ cursor: "pointer" }}
        >
          <span className="brand-badge">MH</span>
          <div className="brand-text">
            <span className="brand-title">Career Compass</span>
            <span className="brand-sub">Maharashtra Engineering</span>
          </div>
        </div>

        <nav className="nav-actions">
          <button
            className={`nav-btn ${activeView === "recommend" ? "active" : ""}`}
            onClick={() => setActiveView("recommend")}
          >
            ✨ Find My College
          </button>
          <button
            className={`nav-btn ${activeView === "browse" ? "active" : ""}`}
            onClick={() => setActiveView("browse")}
          >
            🏛️ Browse All Colleges
          </button>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
