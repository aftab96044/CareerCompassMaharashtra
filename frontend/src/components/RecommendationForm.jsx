import React, { useState } from "react";

const DISTRICT_OPTIONS = [
  "Anywhere in Maharashtra",
  "Pune",
  "Mumbai",
  "Thane",
  "Nagpur",
  "Nashik",
  "Chhatrapati Sambhajinagar",
  "Sangli",
  "Solapur",
  "Kolhapur",
  "Ahmednagar",
  "Amravati",
];

const BRANCH_OPTIONS = [
  "Computer Engineering",
  "Information Technology",
  "Artificial Intelligence & Data Science",
  "Electronics & Telecommunication",
  "Mechanical Engineering",
  "Electrical Engineering",
  "Civil Engineering",
  "Chemical Engineering",
];

function RecommendationForm({ onSubmit, loading }) {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const [formData, setFormData] = useState({
    stream: "PCM",
    entranceExam: "MHT-CET",
    score: "",
    branches: ["Computer Engineering", "Information Technology"],
    location: "Anywhere in Maharashtra",
    budget: "any",
    hostel: "no-preference",
    autonomous: "preferred",
    collegeType: "any",
    priorities: {
      goodPlacements: true,
      codingOpportunities: true,
      sports: false,
      clubs: false,
    },
  });

  const handleBranchToggle = (branch) => {
    setFormData((prev) => {
      const exists = prev.branches.includes(branch);
      if (exists) {
        return { ...prev, branches: prev.branches.filter((b) => b !== branch) };
      } else {
        return { ...prev, branches: [...prev.branches, branch] };
      }
    });
  };

  const handlePriorityToggle = (key) => {
    setFormData((prev) => ({
      ...prev,
      priorities: {
        ...prev.priorities,
        [key]: !prev.priorities[key],
      },
    }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="recommendation-form-card">
      <div className="form-header">
        <span className="wizard-tag">AI Recommendation Engine</span>
        <h2>Find My Ideal College</h2>
        <p className="form-subtitle">
          Answer 4 quick steps to discover matching Maharashtra engineering
          colleges based on your real academic profile and priorities.
        </p>

        {/* Progress bar */}
        <div className="wizard-progress">
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            ></div>
          </div>
          <div className="progress-labels">
            <span className={`step-pill ${currentStep >= 1 ? "active" : ""}`}>
              1. Academics
            </span>
            <span className={`step-pill ${currentStep >= 2 ? "active" : ""}`}>
              2. Branch & City
            </span>
            <span className={`step-pill ${currentStep >= 3 ? "active" : ""}`}>
              3. Budget & Hostel
            </span>
            <span className={`step-pill ${currentStep >= 4 ? "active" : ""}`}>
              4. Campus Life
            </span>
          </div>
          <div className="step-indicator">
            Step {currentStep} of {totalSteps}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* STEP 1: Academic Profile */}
        {currentStep === 1 && (
          <div className="form-step fade-in">
            <h3 className="step-title">Step 1: Your Academic Profile</h3>
            <p className="step-desc">
              Tell us about your 12th standard stream and entrance exam.
            </p>

            <div className="form-field-group">
              <label className="field-label">Stream / Discipline</label>
              <div className="stream-locked-badge">
                <span className="stream-icon">⚛️</span>
                <div>
                  <strong>PCM (Physics, Chemistry, Mathematics)</strong>
                  <span className="stream-subtext">
                    Dedicated to Maharashtra Engineering Admissions
                  </span>
                </div>
              </div>
            </div>

            <div className="form-field-group">
              <label className="field-label">Entrance Exam</label>
              <div className="radio-pill-group">
                {["MHT-CET", "JEE Main", "JEE Advanced"].map((exam) => (
                  <button
                    key={exam}
                    type="button"
                    className={`radio-pill ${formData.entranceExam === exam ? "selected" : ""}`}
                    onClick={() =>
                      setFormData({ ...formData, entranceExam: exam })
                    }
                  >
                    {exam}
                  </button>
                ))}
              </div>

              {formData.entranceExam === "MHT-CET" && (
                <div className="exam-guidance-note">
                  ℹ️ <strong>MHT-CET Pathway:</strong> Matches Maharashtra State CAP engineering colleges (COEP, VJTI, ICT, PICT, etc.).
                  <em>Note: IIT Bombay (requires JEE Advanced) and VNIT Nagpur (requires JEE Main) do not accept MHT-CET and are strictly excluded.</em>
                </div>
              )}
              {formData.entranceExam === "JEE Main" && (
                <div className="exam-guidance-note">
                  ℹ️ <strong>JEE Main Pathway:</strong> Matches VNIT Nagpur (requires 94+ percentile) and All-India quota seats in Maharashtra colleges (requires 99+ percentile if targeting IIT Bombay qualification).
                </div>
              )}
              {formData.entranceExam === "JEE Advanced" && (
                <div className="exam-guidance-note">
                  ℹ️ <strong>JEE Advanced Pathway:</strong> Premier pathway for IIT Bombay (requires 99+ percentile in JEE).
                </div>
              )}
            </div>

            <div className="form-field-group">
              <label className="field-label" htmlFor="score-input">
                Your Percentile / Score (Approximate or Expected)
              </label>
              <input
                id="score-input"
                type="number"
                min="0"
                max="100"
                step="0.01"
                placeholder="e.g. 88.5"
                value={formData.score}
                onChange={(e) =>
                  setFormData({ ...formData, score: e.target.value })
                }
                className="text-input"
              />
              <span className="field-hint">
                Enter your percentile (0-100). E.g. 99 for IIT Bombay, 94+ for VNIT Nagpur, 85+ for State Colleges. Leave blank if yet to appear.
              </span>
            </div>
          </div>
        )}

        {/* STEP 2: Branch & Location */}
        {currentStep === 2 && (
          <div className="form-step fade-in">
            <h3 className="step-title">
              Step 2: Preferred Branches & Location
            </h3>
            <p className="step-desc">
              Select one or multiple engineering branches you are interested in.
            </p>

            <div className="form-field-group">
              <label className="field-label">Target Engineering Branches</label>
              <div className="chip-selection-grid">
                {BRANCH_OPTIONS.map((branch) => {
                  const isSelected = formData.branches.includes(branch);
                  return (
                    <button
                      key={branch}
                      type="button"
                      className={`selection-chip ${isSelected ? "selected" : ""}`}
                      onClick={() => handleBranchToggle(branch)}
                    >
                      {isSelected ? "✓ " : "+ "} {branch}
                    </button>
                  );
                })}
              </div>
              <span className="field-hint">
                You can select multiple branches to widen your recommendations.
              </span>
            </div>

            <div className="form-field-group">
              <label className="field-label" htmlFor="location-select">
                Location Preference
              </label>
              <select
                id="location-select"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                className="select-input"
              >
                {DISTRICT_OPTIONS.map((dist) => (
                  <option key={dist} value={dist}>
                    {dist}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* STEP 3: Budget & Hostel */}
        {currentStep === 3 && (
          <div className="form-step fade-in">
            <h3 className="step-title">Step 3: Annual Budget & Hostel</h3>
            <p className="step-desc">
              Help us match colleges that fit your financial plan and stay
              needs.
            </p>

            <div className="form-field-group">
              <label className="field-label">Annual Tuition Fee Budget</label>
              <div className="radio-pill-group wrap">
                {[
                  { key: "any", label: "Any Budget" },
                  { key: "under-1lakh", label: "Under ₹1 Lakh" },
                  { key: "1-2lakh", label: "₹1–2 Lakh" },
                  { key: "2-3lakh", label: "₹2–3 Lakh" },
                  { key: "above-3lakh", label: "Above ₹3 Lakh" },
                ].map((b) => (
                  <button
                    key={b.key}
                    type="button"
                    className={`radio-pill ${formData.budget === b.key ? "selected" : ""}`}
                    onClick={() => setFormData({ ...formData, budget: b.key })}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-field-group">
              <label className="field-label">Campus Hostel Requirement</label>
              <div className="radio-pill-group">
                {[
                  { key: "required", label: "Hostel Required" },
                  {
                    key: "not-required",
                    label: "Not Required (Day Scholar/Local)",
                  },
                  { key: "no-preference", label: "No Preference" },
                ].map((h) => (
                  <button
                    key={h.key}
                    type="button"
                    className={`radio-pill ${formData.hostel === h.key ? "selected" : ""}`}
                    onClick={() => setFormData({ ...formData, hostel: h.key })}
                  >
                    {h.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Campus Priorities & Status */}
        {currentStep === 4 && (
          <div className="form-step fade-in">
            <h3 className="step-title">Step 4: Campus Life & Priorities</h3>
            <p className="step-desc">
              Choose your institutional preferences and extracurricular
              interests.
            </p>

            <div className="form-field-group">
              <label className="field-label">Autonomous Status</label>
              <div className="radio-pill-group">
                {[
                  { key: "preferred", label: "Autonomous Preferred" },
                  { key: "no-preference", label: "No Preference" },
                ].map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    className={`radio-pill ${formData.autonomous === opt.key ? "selected" : ""}`}
                    onClick={() =>
                      setFormData({ ...formData, autonomous: opt.key })
                    }
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-field-group">
              <label className="field-label">College Type</label>
              <div className="radio-pill-group">
                {[
                  { key: "any", label: "All / Any Type" },
                  { key: "Government", label: "Government / Aided" },
                  { key: "Private", label: "Private Institutes" },
                ].map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    className={`radio-pill ${formData.collegeType === t.key ? "selected" : ""}`}
                    onClick={() =>
                      setFormData({ ...formData, collegeType: t.key })
                    }
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-field-group">
              <label className="field-label">Key Factors You Care About</label>
              <div className="checkbox-cards-grid">
                <div
                  className={`priority-card ${formData.priorities.goodPlacements ? "active" : ""}`}
                  onClick={() => handlePriorityToggle("goodPlacements")}
                >
                  <span className="priority-icon">📈</span>
                  <div className="priority-info">
                    <strong>Strong Placements</strong>
                    <small>High placement % & average packages</small>
                  </div>
                </div>

                <div
                  className={`priority-card ${formData.priorities.codingOpportunities ? "active" : ""}`}
                  onClick={() => handlePriorityToggle("codingOpportunities")}
                >
                  <span className="priority-icon">💻</span>
                  <div className="priority-info">
                    <strong>Coding & Tech Culture</strong>
                    <small>
                      Active coding clubs, hackathons, & tech events
                    </small>
                  </div>
                </div>

                <div
                  className={`priority-card ${formData.priorities.sports ? "active" : ""}`}
                  onClick={() => handlePriorityToggle("sports")}
                >
                  <span className="priority-icon">⚽</span>
                  <div className="priority-info">
                    <strong>Sports Facilities</strong>
                    <small>Football, cricket, basketball grounds</small>
                  </div>
                </div>

                <div
                  className={`priority-card ${formData.priorities.clubs ? "active" : ""}`}
                  onClick={() => handlePriorityToggle("clubs")}
                >
                  <span className="priority-icon">🎭</span>
                  <div className="priority-info">
                    <strong>Cultural & Arts Clubs</strong>
                    <small>Theatre, music, dance, and creative societies</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Wizard Controls */}
        <div className="wizard-controls">
          {currentStep > 1 && (
            <button
              type="button"
              className="wizard-btn secondary"
              onClick={handleBack}
            >
              ← Back
            </button>
          )}

          {currentStep < totalSteps ? (
            <button
              type="button"
              className="wizard-btn primary"
              onClick={handleNext}
            >
              Continue to Step {currentStep + 1} →
            </button>
          ) : (
            <button
              type="submit"
              className="wizard-btn submit"
              disabled={loading}
            >
              {loading
                ? "Analyzing MongoDB Colleges..."
                : "🎯 Generate My Recommendations"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default RecommendationForm;
