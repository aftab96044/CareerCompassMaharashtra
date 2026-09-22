const { handleChatQuery } = require("../services/aiService");

async function chatWithAI(req, res) {
  try {
    const { question, recommendedColleges, studentProfile } = req.body || {};
    if (!question || typeof question !== "string" || question.trim() === "") {
      return res
        .status(400)
        .json({ error: "Please provide a valid question." });
    }

    const response = await handleChatQuery({
      question: question.trim(),
      recommendedColleges: Array.isArray(recommendedColleges)
        ? recommendedColleges
        : [],
      studentProfile: studentProfile || {},
    });

    return res.status(200).json(response);
  } catch (error) {
    console.error("AI Chat error:", error);
    return res.status(500).json({
      error: "Failed to process AI query",
      message: error.message,
    });
  }
}

module.exports = {
  chatWithAI,
};
