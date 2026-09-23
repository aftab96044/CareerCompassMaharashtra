import React, { useState } from "react";
import AIChatAssistant from "./AIChatAssistant";

function RecommendationResults({
  results,
  studentProfile,
  onModifyPreferences,
  onSelectCollegeForModal,
}) {
  const [activeTab, setActiveTab] = useState("recommended"); // 'recommended' | 'considerations'
  const [selectedCollegeModal, setSelectedCollegeModal] = useState(null);

  const recommendedList = results?.recommended || [];
  const considerationsList = results?.considerations || [];

  const currentList =
    activeTab === "recommended" ? recommendedList : considerationsList;

  return (
    <div className="recommendation-results-container fade-in">
      {/* Header and Student Preferences Pill Summary */}
      <div className="results-header">
        <div className="results-title-group">
          <span className="results-tag">Matching Completed</span>
          <h2>Your Maharashtra College Recommendations</h2>
          <p className="results-subtitle">
            Evaluated against real MongoDB engineering college data in
            Maharashtra.
          </p>
        </div>

        <button className="modify-btn" onClick={onModifyPreferences}>
          ⚙️ Edit Preferences
        </button>
      </div>

      {/* Profile summary banner */}
      <div className="student-profile-summary">
        <span className="summary-title">Your Profile:</span>
        <span className="summary-chip">Stream: PCM (Engineering)</span>
        <span className="summary-chip">
          Exam: {studentProfile?.entranceExam || "MHT-CET"}
        </span>
        {studentProfile?.score && (
          <span className="summary-chip">Score: {studentProfile.score}</span>
        )}
        <span className="summary-chip">
          Location: {studentProfile?.location || "Maharashtra"}
        </span>
        <span className="summary-chip">
          Hostel:{" "}
          {studentProfile?.hostel === "required" ? "Required" : "Flexible"}
        </span>
      </div>

      {/* Official Mandatory Disclaimer Banner */}
      <div className="disclaimer-banner">
        <span className="disclaimer-icon">⚠️</span>
        <div className="disclaimer-text">
          <strong>Important Guidance Notice:</strong> Recommendations are
          calculated based on your indicated preferences and official college
          records. This does <em>not</em> constitute an admission guarantee or
          cut-off prediction. Actual admission depends strictly on eligibility
          criteria, annual CAP cutoffs, seat availability, and State Common
          Entrance Test Cell (CET Cell) counselling rules.
        </div>
      </div>

      {/* Main Grid: Colleges + AI Assistant */}
      <div className="results-layout-grid">
        {/* Left Column: Recommendations */}
        <div className="colleges-column">
          {/* Section Tabs */}
          <div className="results-tabs">
            <button
              className={`tab-btn ${activeTab === "recommended" ? "active" : ""}`}
              onClick={() => setActiveTab("recommended")}
            >
              ⭐ Your Recommended Colleges ({recommendedList.length})
            </button>
            <button
              className={`tab-btn ${activeTab === "considerations" ? "active" : ""}`}
              onClick={() => setActiveTab("considerations")}
            >
              🔍 Other Colleges You May Consider ({considerationsList.length})
            </button>
          </div>

          {currentList.length === 0 ? (
            <div className="no-matches-card">
              <h3>No colleges found in this tier</h3>
              <p>
                Try widening your preferred location or adjusting your budget
                filter.
              </p>
              <button className="reset-btn" onClick={onModifyPreferences}>
                Adjust Preferences
              </button>
            </div>
          ) : (
            <div className="recommendation-cards-grid">
              {currentList.map((college, idx) => {
                const avgPkg = college["Avg package"];
                const placementPct = college["Placement %"];
                const feesNum = college.Fees;

                return (
                  <div
                    className="rec-card"
                    key={college._id || college.College + idx}
                  >
                    <div className="rec-card-header">
                      <div className="rec-title-wrap">
                        <span className="rank-badge">#{idx + 1}</span>
                        <h3 className="rec-college-name">{college.College}</h3>
                      </div>
                      <div className="match-score-badge">
                        <span className="score-number">
                          {college.matchScore}%
                        </span>
                        <span className="score-label">Match</span>
                      </div>
                    </div>

                    <div className="badges">
                      <span className="badge type-badge">
                        {college.Type || "Private"}
                      </span>
                      {college.Autonomous === "Yes" && (
                        <span className="badge auto-badge">Autonomous</span>
                      )}
                      {college["NAAC grade"] && (
                        <span className="badge naac-badge">
                          NAAC {college["NAAC grade"]}
                        </span>
                      )}
                      {Array.isArray(college["Exams Accepted"]) &&
                        college["Exams Accepted"].length > 0 && (
                          <span className="badge exam-badge">
                            📝 {college["Exams Accepted"].join(", ")}
                          </span>
                        )}
                    </div>

                    <div className="rec-facts-grid">
                      <div className="fact-item">
                        <span className="fact-label">📍 Location</span>
                        <span className="fact-value">
                          {college.District || college.City}
                        </span>
                      </div>

                      <div className="fact-item">
                        <span className="fact-label">💵 Annual Tuition</span>
                        <span className="fact-value">
                          {feesNum != null
                            ? `₹${Number(feesNum).toLocaleString()}`
                            : "Contact College"}
                        </span>
                      </div>

                      <div className="fact-item">
                        <span className="fact-label">🏠 Hostel</span>
                        <span className="fact-value">
                          {college.Hostel === "Yes"
                            ? "Available"
                            : "Not Available"}
                        </span>
                      </div>

                      <div className="fact-item">
                        <span className="fact-label">💼 Avg Package</span>
                        <span className="fact-value">
                          {avgPkg ? `${avgPkg} LPA` : "Not listed"}
                        </span>
                      </div>

                      <div className="fact-item">
                        <span className="fact-label">📈 Placement Rate</span>
                        <span className="fact-value">
                          {placementPct ? `${placementPct}%` : "Not listed"}
                        </span>
                      </div>

                      <div className="fact-item">
                        <span className="fact-label">💻 Coding Club</span>
                        <span className="fact-value">
                          {college["Coding Club"] === "Yes"
                            ? "Active"
                            : "No Club"}
                        </span>
                      </div>
                    </div>

                    {/* Transparent Reasons Section */}
                    {college.reasons && college.reasons.length > 0 && (
                      <div className="why-recommended-box">
                        <span className="why-title">
                          Why this college was recommended:
                        </span>
                        <ul className="reasons-list">
                          {college.reasons.map((r, rIdx) => (
                            <li key={rIdx} className="reason-item">
                              <span className="check-icon">✓</span> {r}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="rec-card-actions">
                      {college.Website && (
                        <a
                          href={college.Website}
                          target="_blank"
                          rel="noreferrer"
                          className="action-btn website-btn"
                        >
                          🌐 Official Website
                        </a>
                      )}
                      <button
                        className="action-btn details-btn"
                        onClick={() => setSelectedCollegeModal(college)}
                      >
                        🔍 View Full Details
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: AI Assistant */}
        <div className="ai-column">
          <AIChatAssistant
            recommendedColleges={recommendedList}
            studentProfile={studentProfile}
          />
        </div>
      </div>

      {/* College Detail Modal */}
      {selectedCollegeModal && (
        <div className="modal" onClick={() => setSelectedCollegeModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{selectedCollegeModal.College}</h2>
            <div className="badges">
              <span className="badge">{selectedCollegeModal.Type}</span>
              {selectedCollegeModal.Autonomous === "Yes" && (
                <span className="badge">Autonomous</span>
              )}
              {selectedCollegeModal["NAAC grade"] && (
                <span className="badge">
                  NAAC {selectedCollegeModal["NAAC grade"]}
                </span>
              )}
            </div>

            <div className="modal-detail-section">
              <p>
                📍 <strong>District / City:</strong>{" "}
                {selectedCollegeModal.District}, {selectedCollegeModal.City}
              </p>
              <p>
                💵 <strong>Annual Tuition Fees:</strong>{" "}
                {selectedCollegeModal.Fees
                  ? `₹${Number(selectedCollegeModal.Fees).toLocaleString()}`
                  : "N/A"}
              </p>
              <p>
                🏠 <strong>Campus Hostel:</strong> {selectedCollegeModal.Hostel}
              </p>
              <p>
                💼 <strong>Average Package:</strong>{" "}
                {selectedCollegeModal["Avg package"]
                  ? `${selectedCollegeModal["Avg package"]} LPA`
                  : "N/A"}
              </p>
              <p>
                📈 <strong>Placement Percentage:</strong>{" "}
                {selectedCollegeModal["Placement %"]
                  ? `${selectedCollegeModal["Placement %"]}%`
                  : "N/A"}
              </p>
              <p>
                💻 <strong>Coding Club:</strong>{" "}
                {selectedCollegeModal["Coding Club"]}
              </p>
            </div>

            <h3>Exams Accepted</h3>
            <div className="badges">
              {(
                selectedCollegeModal["Exams Accepted"] || [
                  "MHT-CET",
                  "JEE Main",
                ]
              ).map((exam, i) => (
                <span className="badge exam-badge" key={i}>
                  {exam}
                </span>
              ))}
            </div>

            <h3>Branches Offered</h3>
            <div className="badges">
              {(selectedCollegeModal.Branches || []).map((branch, i) => (
                <span className="badge branch-badge" key={i}>
                  {branch}
                </span>
              ))}
            </div>

            <h3>Extracurriculars & Clubs</h3>
            <div className="clubs-grid-modal">
              <span>Football: {selectedCollegeModal.Football || "No"}</span>
              <span>Cricket: {selectedCollegeModal.Cricket || "No"}</span>
              <span>Basketball: {selectedCollegeModal.Basketball || "No"}</span>
              <span>
                Theatre Club: {selectedCollegeModal["Theatre Club"] || "No"}
              </span>
              <span>
                Music Club: {selectedCollegeModal["Music Club"] || "No"}
              </span>
              <span>
                Dance Club: {selectedCollegeModal["Dance Club"] || "No"}
              </span>
              <span>Art Club: {selectedCollegeModal["Art Club"] || "No"}</span>
            </div>

            {selectedCollegeModal.Website && (
              <p style={{ marginTop: "15px" }}>
                🌐{" "}
                <a
                  href={selectedCollegeModal.Website}
                  target="_blank"
                  rel="noreferrer"
                >
                  Visit {selectedCollegeModal.College} Website
                </a>
              </p>
            )}

            <button
              className="close-btn"
              onClick={() => setSelectedCollegeModal(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default RecommendationResults;
