const mongoose = require("mongoose");
const { WEIGHTS, THRESHOLDS, BUDGET_RANGES } = require("../config/weights");
const College = require("../models/College");
const fs = require("fs");
const path = require("path");

// Helper to sanitize college object: Strictly removes Highest Package
function sanitizeCollege(college) {
  const plain = college.toObject ? college.toObject() : { ...college };
  delete plain["Highest Package"];
  delete plain["highestPackage"];
  delete plain["highestPackageLPA"];
  return plain;
}

// Fallback loader if DB is momentarily unreachable
function getFallbackColleges() {
  try {
    const fallbackPath = path.join(
      __dirname,
      "..",
      "data",
      "defaultColleges.json",
    );
    if (fs.existsSync(fallbackPath)) {
      return JSON.parse(fs.readFileSync(fallbackPath, "utf8"));
    }
  } catch (err) {
    console.error("Error reading fallback colleges:", err);
  }
  return [];
}

async function fetchAllColleges() {
  if (mongoose.connection.readyState === 1) {
    try {
      const colleges = await College.find().lean();
      if (colleges && colleges.length > 0) {
        return colleges;
      }
    } catch (error) {
      console.warn(
        "MongoDB query failed, using verified fallback data:",
        error.message,
      );
    }
  }
  return getFallbackColleges();
}

/**
 * Normalizes branch name matching
 */
function branchMatches(collegeBranches, preferredBranches) {
  if (!preferredBranches || preferredBranches.length === 0)
    return { matches: true, matchedNames: [] };
  if (
    !collegeBranches ||
    !Array.isArray(collegeBranches) ||
    collegeBranches.length === 0
  ) {
    return { matches: false, matchedNames: [] };
  }

  const matched = [];
  for (const pref of preferredBranches) {
    const prefLower = pref.toLowerCase();
    const found = collegeBranches.find((b) => {
      const bLower = b.toLowerCase();
      if (bLower.includes(prefLower) || prefLower.includes(bLower)) return true;
      if (
        prefLower.includes("computer") &&
        (bLower.includes("computer") ||
          bLower.includes("cse") ||
          bLower.includes("software"))
      )
        return true;
      if (
        prefLower.includes("information") &&
        (bLower.includes("information") || bLower.includes("it"))
      )
        return true;
      if (
        prefLower.includes("ai") &&
        (bLower.includes("artificial") ||
          bLower.includes("data science") ||
          bLower.includes("ai"))
      )
        return true;
      if (prefLower.includes("mechanical") && bLower.includes("mechanical"))
        return true;
      if (prefLower.includes("civil") && bLower.includes("civil")) return true;
      if (prefLower.includes("electrical") && bLower.includes("electrical"))
        return true;
      if (
        prefLower.includes("electronic") &&
        (bLower.includes("electronic") ||
          bLower.includes("extc") ||
          bLower.includes("telecom"))
      )
        return true;
      return false;
    });
    if (found && !matched.includes(found)) {
      matched.push(found);
    }
  }
  return { matches: matched.length > 0, matchedNames: matched };
}

/**
 * Evaluates budget match
 */
function evaluateBudget(collegeFees, budgetKey) {
  if (!budgetKey || budgetKey === "any")
    return { score: WEIGHTS.BUDGET_MATCH, matches: true };
  if (
    collegeFees === null ||
    collegeFees === undefined ||
    isNaN(Number(collegeFees))
  ) {
    return { score: WEIGHTS.BUDGET_MATCH * 0.5, matches: false }; // Missing fee info: neutral partial
  }

  const fees = Number(collegeFees);
  const range = BUDGET_RANGES[budgetKey];
  if (!range) return { score: WEIGHTS.BUDGET_MATCH * 0.7, matches: true };

  if (fees >= range.min && fees <= range.max) {
    return { score: WEIGHTS.BUDGET_MATCH, matches: true };
  }

  // Allow 15% tolerance buffer
  if (fees <= range.max * 1.15) {
    return { score: WEIGHTS.BUDGET_MATCH * 0.6, matches: true, partial: true };
  }

  return { score: 0, matches: false };
}

/**
 * Computes transparent recommendation scores and reasons
 */
async function generateRecommendations(preferences = {}) {
  const rawColleges = await fetchAllColleges();
  const {
    stream = "PCM",
    entranceExam = "MHT-CET",
    score = 0,
    branches = [],
    budget = "any",
    hostel = "no-preference",
    location = "anywhere",
    autonomous = "no-preference",
    collegeType = "any",
    priorities = {},
  } = preferences;

  const scoredColleges = rawColleges.map((collegeRaw) => {
    const college = sanitizeCollege(collegeRaw);
    let totalScore = 0;
    const reasons = [];

    // 1. Branch Preference Matching
    const branchCheck = branchMatches(college.Branches, branches);
    if (branchCheck.matches && branchCheck.matchedNames.length > 0) {
      totalScore += WEIGHTS.BRANCH_MATCH;
      const displayBranches = branchCheck.matchedNames.slice(0, 2).join(", ");
      reasons.push(`Offers your preferred branch (${displayBranches})`);
    } else if (branches.length === 0) {
      totalScore += WEIGHTS.BRANCH_MATCH * 0.8;
    }

    // 2. Budget Matching
    const budgetCheck = evaluateBudget(college.Fees, budget);
    totalScore += budgetCheck.score;
    if (budgetCheck.matches && college.Fees != null) {
      reasons.push(
        `Fits your budget (₹${Number(college.Fees).toLocaleString()}/year)`,
      );
    }

    // 3. Location Matching
    const locLower = (location || "").trim().toLowerCase();
    const distLower = (college.District || "").toLowerCase();
    const cityLower = (college.City || "").toLowerCase();

    if (
      !locLower ||
      locLower === "anywhere" ||
      locLower === "anywhere in maharashtra"
    ) {
      totalScore += WEIGHTS.LOCATION_MATCH;
    } else if (distLower.includes(locLower) || cityLower.includes(locLower)) {
      totalScore += WEIGHTS.LOCATION_MATCH;
      reasons.push(
        `Located in your preferred area (${college.District || college.City})`,
      );
    } else {
      totalScore += 2; // small baseline
    }

    // 4. Hostel Matching
    if (hostel === "required") {
      if (college.Hostel === "Yes") {
        totalScore += WEIGHTS.HOSTEL_MATCH;
        reasons.push("Campus hostel facility available");
      }
    } else if (hostel === "not-required") {
      totalScore += WEIGHTS.HOSTEL_MATCH;
    } else {
      totalScore += WEIGHTS.HOSTEL_MATCH * 0.85;
      if (college.Hostel === "Yes") {
        reasons.push("Campus hostel facility available");
      }
    }

    // 5. Autonomous & College Type Matching
    if (autonomous === "preferred") {
      if (college.Autonomous === "Yes") {
        totalScore += WEIGHTS.AUTONOMOUS_MATCH;
        reasons.push("Autonomous institute (academic flexibility)");
      }
    } else {
      totalScore += WEIGHTS.AUTONOMOUS_MATCH * 0.7;
    }

    if (collegeType && collegeType !== "any") {
      if (
        (college.Type || "").toLowerCase().includes(collegeType.toLowerCase())
      ) {
        totalScore += 5;
        reasons.push(`${college.Type} college`);
      }
    }

    // 6. Placement Performance
    const avgPackageNum = parseFloat(college["Avg package"]) || 0;
    const placementPctNum = parseFloat(college["Placement %"]) || 0;

    let placementScore = 0;
    if (avgPackageNum >= 10) placementScore += 5;
    else if (avgPackageNum >= 6) placementScore += 3.5;
    else if (avgPackageNum > 0) placementScore += 2;

    if (placementPctNum >= 80) placementScore += 5;
    else if (placementPctNum >= 65) placementScore += 3.5;
    else if (placementPctNum > 0) placementScore += 2;

    totalScore += placementScore;

    if (avgPackageNum >= 7 || placementPctNum >= 75) {
      reasons.push(
        `Strong placement record (${avgPackageNum ? `Avg ~${avgPackageNum} LPA` : ""}${placementPctNum ? `, ${placementPctNum}% placed` : ""})`,
      );
    }

    // 7. Campus Life & Clubs
    let clubScore = 0;
    if (priorities.codingOpportunities && college["Coding Club"] === "Yes") {
      clubScore += 2;
      reasons.push("Active coding culture & tech clubs");
    }
    if (
      priorities.sports &&
      (college.Football === "Yes" ||
        college.Cricket === "Yes" ||
        college.Basketball === "Yes")
    ) {
      clubScore += 1.5;
      reasons.push("Excellent sports facilities");
    }
    if (
      priorities.clubs &&
      (college["Theatre Club"] === "Yes" ||
        college["Music Club"] === "Yes" ||
        college["Dance Club"] === "Yes")
    ) {
      clubScore += 1.5;
      reasons.push("Vibrant cultural clubs & activities");
    }
    totalScore += Math.min(WEIGHTS.CAMPUS_LIFE_CLUBS, clubScore);

    // NAAC Grade Bonus if exceptional
    if (college["NAAC grade"] === "A++" || college["NAAC grade"] === "A+") {
      totalScore += 2;
      reasons.push(`Accredited with NAAC ${college["NAAC grade"]}`);
    }

    // Cap totalScore at 99 (never 100 to emphasize guidance, not guaranteed outcome)
    const normalizedScore = Math.min(98, Math.max(20, Math.round(totalScore)));

    // Fallback reason if none triggered
    if (reasons.length === 0) {
      reasons.push("Accredited engineering institute in Maharashtra");
    }

    return {
      ...college,
      matchScore: normalizedScore,
      reasons: reasons.slice(0, 5), // Top 5 verified reasons
    };
  });

  // Sort descending by match score, then by avg package
  scoredColleges.sort((a, b) => {
    if (b.matchScore !== a.matchScore) {
      return b.matchScore - a.matchScore;
    }
    const bPkg = parseFloat(b["Avg package"]) || 0;
    const aPkg = parseFloat(a["Avg package"]) || 0;
    return bPkg - aPkg;
  });

  const recommended = scoredColleges.filter(
    (c) => c.matchScore >= THRESHOLDS.RECOMMENDED_MIN_SCORE,
  );
  const considerations = scoredColleges.filter(
    (c) =>
      c.matchScore >= THRESHOLDS.CONSIDERATION_MIN_SCORE &&
      c.matchScore < THRESHOLDS.RECOMMENDED_MIN_SCORE,
  );

  return {
    studentProfile: {
      stream,
      entranceExam,
      score,
      branches,
      budget,
      hostel,
      location,
      autonomous,
      collegeType,
    },
    totalEvaluated: scoredColleges.length,
    recommendedCount: recommended.length,
    considerationsCount: considerations.length,
    recommended: recommended.slice(0, 12),
    considerations: considerations.slice(0, 12),
  };
}

module.exports = {
  generateRecommendations,
  fetchAllColleges,
  sanitizeCollege,
};
