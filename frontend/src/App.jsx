import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "./components/Navbar";
import RecommendationForm from "./components/RecommendationForm";
import RecommendationResults from "./components/RecommendationResults";
import "./App.css";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const API_URL = import.meta.env.VITE_API_URL || `${API_BASE_URL}/api/colleges`;
const REC_API_URL =
  import.meta.env.VITE_REC_API_URL || `${API_BASE_URL}/api/recommendations`;

function App() {
  // Navigation view state: 'landing' | 'recommend' | 'browse'
  const [activeView, setActiveView] = useState("landing");

  // Colleges data for browser
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Recommendations state
  const [recommendationResults, setRecommendationResults] = useState(null);
  const [recommendationLoading, setRecommendationLoading] = useState(false);
  const [recommendationError, setRecommendationError] = useState(null);
  const [lastStudentProfile, setLastStudentProfile] = useState(null);

  // Browser filter states
  const [search, setSearch] = useState("");
  const [hostelFilter, setHostelFilter] = useState(false);
  const [codingFilter, setCodingFilter] = useState(false);
  const [autonomousFilter, setAutonomousFilter] = useState(false);
  const [footballFilter, setFootballFilter] = useState(false);
  const [cricketFilter, setCricketFilter] = useState(false);
  const [basketballFilter, setBasketballFilter] = useState(false);
  const [otherSportsFilter, setOtherSportsFilter] = useState(false);
  const [packageFilter, setPackageFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [feesFilter, setFeesFilter] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [theatreFilter, setTheatreFilter] = useState(false);
  const [artFilter, setArtFilter] = useState(false);
  const [danceFilter, setDanceFilter] = useState(false);
  const [musicFilter, setMusicFilter] = useState(false);
  const [showSports, setShowSports] = useState(false);
  const [showAmenities, setShowAmenities] = useState(false);
  const [showCultural, setShowCultural] = useState(false);
  const [selectedCollege, setSelectedCollege] = useState(null);

  // Load all colleges on mount
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    axios
      .get(API_URL)
      .then((response) => {
        if (isMounted) setColleges(response.data);
      })
      .catch((err) => {
        if (isMounted) {
          console.error("Failed to fetch colleges:", err);
          setError(
            "Couldn't load college data. Make sure the backend server is running.",
          );
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Handle recommendation form submission
  const handleRecommendationSubmit = async (formData) => {
    setRecommendationLoading(true);
    setRecommendationError(null);
    setLastStudentProfile(formData);

    try {
      const res = await axios.post(REC_API_URL, formData);
      setRecommendationResults(res.data);
    } catch (err) {
      console.error("Recommendation fetch error:", err);
      setRecommendationError(
        "Could not generate recommendations. Please ensure the backend server is running.",
      );
    } finally {
      setRecommendationLoading(false);
    }
  };

  const resetFilters = () => {
    setSearch("");
    setHostelFilter(false);
    setCodingFilter(false);
    setAutonomousFilter(false);
    setFootballFilter(false);
    setCricketFilter(false);
    setBasketballFilter(false);
    setOtherSportsFilter(false);
    setPackageFilter("");
    setTypeFilter("");
    setFeesFilter("");
    setSortBy("");
    setTheatreFilter(false);
    setArtFilter(false);
    setDanceFilter(false);
    setMusicFilter(false);
  };

  const filteredColleges = colleges
    .filter((college) => {
      const matchesSearch = (college.College || "")
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesHostel = !hostelFilter || college.Hostel === "Yes";
      const matchesCoding = !codingFilter || college["Coding Club"] === "Yes";
      const matchesAutonomous =
        !autonomousFilter || college.Autonomous === "Yes";

      const matchesPackage =
        packageFilter === "" ||
        Number(college["Avg package"]) >= Number(packageFilter);

      const matchesType = typeFilter === "" || college.Type === typeFilter;

      const matchesFees =
        feesFilter === "" || Number(college.Fees) <= Number(feesFilter);

      const matchesFootball = !footballFilter || college.Football === "Yes";
      const matchesCricket = !cricketFilter || college.Cricket === "Yes";
      const matchesBasketball =
        !basketballFilter || college.Basketball === "Yes";
      const matchesOtherSports =
        !otherSportsFilter || college["Other Sports"] === "Yes";

      const matchesTheatre =
        !theatreFilter || college["Theatre Club"] === "Yes";
      const matchesArt = !artFilter || college["Art Club"] === "Yes";
      const matchesDance = !danceFilter || college["Dance Club"] === "Yes";
      const matchesMusic = !musicFilter || college["Music Club"] === "Yes";

      return (
        matchesSearch &&
        matchesHostel &&
        matchesCoding &&
        matchesAutonomous &&
        matchesPackage &&
        matchesType &&
        matchesFees &&
        matchesFootball &&
        matchesCricket &&
        matchesBasketball &&
        matchesOtherSports &&
        matchesTheatre &&
        matchesArt &&
        matchesDance &&
        matchesMusic
      );
    })
    .sort((a, b) => {
      if (sortBy === "package-desc") {
        return Number(b["Avg package"]) - Number(a["Avg package"]);
      }
      if (sortBy === "fees-asc") {
        return Number(a.Fees) - Number(b.Fees);
      }
      if (sortBy === "placement-desc") {
        return Number(b["Placement %"]) - Number(a["Placement %"]);
      }
      return 0;
    });

  const totalColleges = colleges.length;
  const autonomousColleges = colleges.filter(
    (c) => c.Autonomous === "Yes",
  ).length;
  const governmentColleges = colleges.filter(
    (c) => c.Type === "Government",
  ).length;

  return (
    <div className="container">
      {/* Top Navbar */}
      <Navbar
        activeView={activeView}
        setActiveView={setActiveView}
        onResetToHero={() => setActiveView("landing")}
      />

      {/* VIEW 1: HERO / LANDING */}
      {activeView === "landing" && (
        <section className="hero-section fade-in">
          <div className="hero-content">
            <span className="hero-badge">
              Maharashtra Engineering Admissions
            </span>
            <h1 className="hero-title">Career Compass Maharashtra</h1>
            <p className="hero-subtitle">
              Empowering students to discover their ideal Maharashtra
              engineering colleges with AI recommendations grounded in real
              MongoDB college data.
            </p>

            <div className="hero-cta-group">
              <button
                className="hero-btn primary"
                onClick={() => setActiveView("recommend")}
              >
                ✨ Find My College (AI Recommender)
              </button>
              <button
                className="hero-btn secondary"
                onClick={() => setActiveView("browse")}
              >
                🏛️ Browse All {totalColleges > 0 ? `${totalColleges} ` : ""}
                Colleges
              </button>
            </div>

            <div className="hero-features-grid">
              <div className="feature-item">
                <span className="feature-icon">🎯</span>
                <h4>Transparent Scoring</h4>
                <p>
                  Calculated points across branches, budget, location, hostel,
                  and placements.
                </p>
              </div>

              <div className="feature-item">
                <span className="feature-icon">🛡️</span>
                <h4>100% Factual</h4>
                <p>
                  Strictly retrieved from verified Maharashtra college databases
                  with zero AI hallucinations.
                </p>
              </div>

              <div className="feature-item">
                <span className="feature-icon">🎓</span>
                <h4>AI College Counsellor</h4>
                <p>
                  Interactive chat to analyze your recommendations and answer
                  college queries.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* VIEW 2: AI RECOMMENDATION WORKFLOW */}
      {activeView === "recommend" && (
        <section className="recommend-view fade-in">
          {!recommendationResults ? (
            <RecommendationForm
              onSubmit={handleRecommendationSubmit}
              loading={recommendationLoading}
            />
          ) : (
            <RecommendationResults
              results={recommendationResults}
              studentProfile={lastStudentProfile}
              onModifyPreferences={() => setRecommendationResults(null)}
              onSelectCollegeForModal={(c) => setSelectedCollege(c)}
            />
          )}

          {recommendationError && (
            <p className="status-msg error-msg">{recommendationError}</p>
          )}
        </section>
      )}

      {/* VIEW 3: BROWSE ALL COLLEGES (Existing Explorer Preserved) */}
      {activeView === "browse" && (
        <section className="browse-view fade-in">
          <div className="browse-header">
            <h2>Explore Maharashtra Engineering Colleges</h2>
            <p className="tagline">
              Filter by fees, placements, location, sports, and clubs.
            </p>
          </div>

          <div className="stats">
            <div className="stat-card">
              <h2>{totalColleges}</h2>
              <p>Total Colleges</p>
            </div>

            <div className="stat-card">
              <h2>{governmentColleges}</h2>
              <p>Government</p>
            </div>

            <div className="stat-card">
              <h2>{autonomousColleges}</h2>
              <p>Autonomous</p>
            </div>
          </div>

          <input
            type="text"
            aria-label="Search colleges"
            placeholder="Search colleges by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />

          <div className="filters">
            <select
              aria-label="Filter by average package"
              value={packageFilter}
              onChange={(e) => setPackageFilter(e.target.value)}
            >
              <option value="">All Packages</option>
              <option value="3">Above 3 LPA</option>
              <option value="5">Above 5 LPA</option>
              <option value="7">Above 7 LPA</option>
              <option value="10">Above 10 LPA</option>
            </select>

            <select
              aria-label="Filter by college type"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="">All Types</option>
              <option value="Government">Government</option>
              <option value="Private">Private</option>
            </select>

            <select
              aria-label="Filter by fees"
              value={feesFilter}
              onChange={(e) => setFeesFilter(e.target.value)}
            >
              <option value="">All Fees</option>
              <option value="100000">Below ₹1 Lakh</option>
              <option value="200000">Below ₹2 Lakhs</option>
              <option value="300000">Below ₹3 Lakhs</option>
            </select>

            <select
              aria-label="Sort colleges"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="">Sort by...</option>
              <option value="package-desc">Avg Package: High to Low</option>
              <option value="fees-asc">Fees: Low to High</option>
              <option value="placement-desc">Placement %: High to Low</option>
            </select>
          </div>

          <div className="filter-sections">
            <div className="filter-group">
              <button
                type="button"
                className="filter-toggle"
                onClick={() => setShowSports(!showSports)}
              >
                {showSports ? "▲ Sports Facilities" : "▼ Sports Facilities"}
              </button>

              {showSports && (
                <div className="filter-options">
                  <label>
                    <input
                      type="checkbox"
                      checked={footballFilter}
                      onChange={() => setFootballFilter(!footballFilter)}
                    />
                    Football
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={cricketFilter}
                      onChange={() => setCricketFilter(!cricketFilter)}
                    />
                    Cricket
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={basketballFilter}
                      onChange={() => setBasketballFilter(!basketballFilter)}
                    />
                    Basketball
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={otherSportsFilter}
                      onChange={() => setOtherSportsFilter(!otherSportsFilter)}
                    />
                    Other Sports
                  </label>
                </div>
              )}
            </div>

            <div className="filter-group">
              <button
                type="button"
                className="filter-toggle"
                onClick={() => setShowCultural(!showCultural)}
              >
                {showCultural ? "🎭 Cultural Clubs ▲" : "🎭 Cultural Clubs ▼"}
              </button>

              {showCultural && (
                <div className="filter-options">
                  <label>
                    <input
                      type="checkbox"
                      checked={theatreFilter}
                      onChange={() => setTheatreFilter(!theatreFilter)}
                    />
                    Theatre Club
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={artFilter}
                      onChange={() => setArtFilter(!artFilter)}
                    />
                    Art Club
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={danceFilter}
                      onChange={() => setDanceFilter(!danceFilter)}
                    />
                    Dance Club
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={musicFilter}
                      onChange={() => setMusicFilter(!musicFilter)}
                    />
                    Music Club
                  </label>
                </div>
              )}
            </div>

            <div className="filter-group">
              <button
                type="button"
                className="filter-toggle"
                onClick={() => setShowAmenities(!showAmenities)}
              >
                {showAmenities
                  ? "▲ Amenities & Status"
                  : "▼ Amenities & Status"}
              </button>

              {showAmenities && (
                <div className="filter-options">
                  <label>
                    <input
                      type="checkbox"
                      checked={hostelFilter}
                      onChange={() => setHostelFilter(!hostelFilter)}
                    />
                    Hostel Available
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={codingFilter}
                      onChange={() => setCodingFilter(!codingFilter)}
                    />
                    Coding Club
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={autonomousFilter}
                      onChange={() => setAutonomousFilter(!autonomousFilter)}
                    />
                    Autonomous
                  </label>
                </div>
              )}
            </div>
          </div>

          <button className="reset-btn" onClick={resetFilters}>
            Reset Filters
          </button>

          <h3>
            Showing {filteredColleges.length} of {colleges.length} colleges
          </h3>

          {loading && <p className="status-msg">Loading colleges...</p>}
          {error && <p className="status-msg error-msg">{error}</p>}
          {!loading && !error && filteredColleges.length === 0 && (
            <p className="status-msg">
              No colleges match your filters. Try loosening a few.
            </p>
          )}

          <div className="cards">
            {!loading &&
              !error &&
              filteredColleges.map((college) => (
                <div className="card" key={college._id || college.College}>
                  <h2>{college.College}</h2>

                  <div className="badges">
                    {college.Autonomous === "Yes" && (
                      <span className="badge">Autonomous</span>
                    )}
                    {college["NAAC grade"] && (
                      <span className="badge">
                        NAAC {college["NAAC grade"]}
                      </span>
                    )}
                  </div>

                  <p>📍 {college.District}</p>
                  <p>
                    💰 Avg Package:{" "}
                    {college["Avg package"]
                      ? `${college["Avg package"]} LPA`
                      : "N/A"}
                  </p>
                  <p>
                    📈 Placement:{" "}
                    {college["Placement %"]
                      ? `${college["Placement %"]}%`
                      : "N/A"}
                  </p>
                  <p>
                    💵 Fees:{" "}
                    {college.Fees != null
                      ? `₹${Number(college.Fees).toLocaleString()}`
                      : "N/A"}
                  </p>

                  <p>
                    🌐{" "}
                    <a href={college.Website} target="_blank" rel="noreferrer">
                      Visit Website
                    </a>
                  </p>

                  <button onClick={() => setSelectedCollege(college)}>
                    View Details
                  </button>
                </div>
              ))}
          </div>
        </section>
      )}

      {/* College Details Modal for Browser */}
      {selectedCollege && (
        <div className="modal" onClick={() => setSelectedCollege(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{selectedCollege.College}</h2>
            <p>Type: {selectedCollege.Type}</p>
            <h3>Exams Accepted</h3>
            <div className="badges">
              {(
                selectedCollege["Exams Accepted"] || ["MHT-CET", "JEE Main"]
              ).map((exam, index) => (
                <span className="badge" key={index}>
                  {exam}
                </span>
              ))}
            </div>
            <h3>Branches Offered</h3>
            <div className="badges">
              {(selectedCollege.Branches || []).map((branch, index) => (
                <span className="badge branch-badge" key={index}>
                  {branch}
                </span>
              ))}
            </div>
            <button
              className="close-btn"
              onClick={() => setSelectedCollege(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Footer & Guidance Disclaimer */}
      <footer className="footer">
        <p>
          <strong>Disclaimer:</strong> Career Compass Maharashtra is a guidance
          tool. College data is sourced from institutional reports and official
          disclosures. Actual admission eligibility, cutoffs, and seat
          allocations are determined solely by the State CET Cell Maharashtra
          counselling rounds.
        </p>
        <p className="copyright-line">
          © 2026 Career Compass Maharashtra | Built for Maharashtra Engineering
          Aspirants.
        </p>
      </footer>
    </div>
  );
}

export default App;
