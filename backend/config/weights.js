// Configurable weights for recommendation engine scoring
// Total possible score targets 100 points
module.exports = {
  WEIGHTS: {
    BRANCH_MATCH: 25, // Student's preferred branch offered
    BUDGET_MATCH: 20, // Fits annual fees preference
    LOCATION_MATCH: 15, // Matches preferred district/city
    HOSTEL_MATCH: 15, // Hostel requirement satisfied
    AUTONOMOUS_MATCH: 10, // Autonomous status matches preference
    PLACEMENT_PERFORMANCE: 10, // Placement % and average package rating
    CAMPUS_LIFE_CLUBS: 5, // Coding club, sports, cultural activities
  },
  THRESHOLDS: {
    RECOMMENDED_MIN_SCORE: 55, // Threshold to be in "Your Recommended Colleges"
    CONSIDERATION_MIN_SCORE: 35, // Threshold for "Other Colleges You May Consider"
  },
  BUDGET_RANGES: {
    "under-1lakh": { min: 0, max: 100000, label: "Under ₹1 Lakh" },
    "1-2lakh": { min: 100000, max: 200000, label: "₹1–2 Lakh" },
    "2-3lakh": { min: 200000, max: 300000, label: "₹2–3 Lakh" },
    "above-3lakh": { min: 300000, max: Infinity, label: "Above ₹3 Lakh" },
    any: { min: 0, max: Infinity, label: "Any Budget" },
  },
};
