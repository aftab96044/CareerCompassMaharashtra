const {
  generateRecommendations,
} = require("../services/recommendationService");

async function getRecommendations(req, res) {
  try {
    const preferences = req.body || {};
    const results = await generateRecommendations(preferences);
    return res.status(200).json(results);
  } catch (error) {
    console.error("Recommendation error:", error);
    return res.status(500).json({
      error: "Failed to generate recommendations",
      message: error.message,
    });
  }
}

module.exports = {
  getRecommendations,
};
