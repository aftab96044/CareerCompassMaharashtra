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
      "defaultColleges.json"
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
        error.message
      );
    }
  }
  return getFallbackColleges();
}

/**
 * Benchmark cutoff percentiles for Maharashtra Engineering Colleges
 * Factual reference values based on historical CAP Rounds (General Open Category)
 */
const COLLEGE_CUTOFF_BENCHMARKS = {
  "IIT Bombay": { cet: null, jee: 99.0 },
  "VNIT Nagpur": { cet: null, jee: 94.0 },
  "COEP Technological University": { cet: 99.0, jee: 98.5 },
  "VJTI": { cet: 98.8, jee: 98.5 },
  "SPIT Mumbai": { cet: 98.5, jee: 98.0 },
  "PICT Pune": { cet: 98.5, jee: 98.0 },
  "ICT Mumbai": { cet: 98.0, jee: 97.5 },
  "Walchand College of Engineering": { cet: 96.0, jee: 95.0 },
  "Vishwakarma Institute of Technology": { cet: 95.0, jee: 94.0 },
  "DJ Sanghvi College of Engineering": { cet: 95.0, jee: 94.0 },
  "Pimpri Chinchwad College of Engineering": { cet: 94.0, jee: 93.0 },
  "Army Institute of Technology": { cet: null, jee: 93.0 },
  "K. J. Somaiya College of Engineering": { cet: 93.0, jee: 92.0 },
  "International Institute of Information Technology (I²IT)": { cet: 90.0, jee: 89.0 },
  "Vishwakarma Institute of Information Technology": { cet: 90.0, jee: 89.0 },
  "Thadomal Shahani Engineering College": { cet: 91.0, jee: 90.0 },
  "Vivekanand Education Society's Institute of Technology": { cet: 90.0, jee: 89.0 },
  "Shri Ramdeobaba College of Engineering and Management": { cet: 89.0, jee: 88.0 },
  "Government College of Engineering Aurangabad": { cet: 89.0, jee: 88.0 },
  "Fr. Conceicao Rodrigues College of Engineering": { cet: 88.0, jee: 87.0 },
  "MIT World Peace University": { cet: 88.0, jee: 87.0 },
  "Government College of Engineering Amravati": { cet: 87.0, jee: 86.0 },
  "Vidyalankar Institute of Technology": { cet: 86.0, jee: 85.0 },
  "Fr. Conceicao Rodrigues Institute of Technology": { cet: 86.0, jee: 85.0 },
  "MIT Academy of Engineering": { cet: 86.0, jee: 85.0 },
  "K. J. Somaiya Institute of Technology": { cet: 84.0, jee: 83.0 },
  "D. Y. Patil Institute of Technology": { cet: 84.0, jee: 83.0 },
  "D. Y. Patil College of Engineering": { cet: 82.0, jee: 81.0 },
  "SIES Graduate School of Technology": { cet: 82.0, jee: 81.0 },
  "Ramrao Adik Institute of Technology": { cet: 82.0, jee: 81.0 },
  "Bharati Vidyapeeth College of Engineering Pune": { cet: 82.0, jee: 81.0 },
  "AISSMS College of Engineering": { cet: 80.0, jee: 79.0 },
  "Progressive Education Society's Modern College of Engineering": { cet: 80.0, jee: 79.0 },
  "St. Francis Institute of Technology": { cet: 80.0, jee: 79.0 },
  "K. K. Wagh Institute of Engineering Education and Research": { cet: 80.0, jee: 79.0 },
  "Yeshwantrao Chavan College of Engineering": { cet: 80.0, jee: 79.0 },
  "Don Bosco Institute of Technology": { cet: 78.0, jee: 77.0 },
  "JSPM Rajarshi Shahu College of Engineering": { cet: 78.0, jee: 77.0 },
  "Rajarambapu Institute of Technology": { cet: 78.0, jee: 77.0 },
  "Shah and Anchor Kutchhi Engineering College": { cet: 77.0, jee: 76.0 },
  "Sinhgad College of Engineering": { cet: 76.0, jee: 75.0 },
  "Bharati Vidyapeeth College of Engineering Navi Mumbai": { cet: 76.0, jee: 75.0 },
  "Walchand Institute of Technology": { cet: 70.0, jee: 68.0 },
  "Kolhapur Institute of Technology": { cet: 68.0, jee: 66.0 },
  "Sanjivani College of Engineering": { cet: 68.0, jee: 66.0 },
  "Indira College of Engineering and Management": { cet: 65.0, jee: 64.0 },
  "Nutan Maharashtra Institute of Engineering and Technology": { cet: 65.0, jee: 64.0 },
  "G. H. Raisoni College of Engineering": { cet: 65.0, jee: 64.0 },
};

function getCollegeBenchmarkCutoff(collegeName, examType) {
  for (const [name, cuts] of Object.entries(COLLEGE_CUTOFF_BENCHMARKS)) {
    if (
      collegeName.toLowerCase().includes(name.toLowerCase()) ||
      name.toLowerCase().includes(collegeName.toLowerCase())
    ) {
      return (examType || "").toLowerCase().includes("cet") ? cuts.cet : cuts.jee;
    }
  }
  return (examType || "").toLowerCase().includes("cet") ? 75.0 : 73.0;
}

/**
 * Evaluates Entrance Exam eligibility and Percentile fit
 */
function evaluateExamAndCutoff(college, entranceExam = "MHT-CET", userScore = null) {
  const collegeName = college.College || "";
  const acceptedExams = Array.isArray(college["Exams Accepted"])
    ? college["Exams Accepted"]
    : ["MHT-CET", "JEE Main"];

  const normExam = (entranceExam || "MHT-CET").trim();
  const parsedScore =
    userScore !== "" && userScore !== null && userScore !== undefined && !isNaN(Number(userScore))
      ? Number(userScore)
      : null;

  // 1. STRICT DISQUALIFICATION FOR MHT-CET
  // IIT Bombay accepts ONLY JEE Advanced; VNIT Nagpur accepts ONLY JEE Main.
  if (normExam === "MHT-CET") {
    if (
      collegeName.includes("IIT Bombay") ||
      collegeName.includes("VNIT") ||
      !acceptedExams.includes("MHT-CET")
    ) {
      return {
        isEligible: false,
        score: 0,
        reason: null,
      };
    }
  }

  // 2. SPECIAL HANDLING FOR IIT BOMBAY
  // Criteria: Only matches JEE percentile (>= 99 required in JEE Advanced / JEE Main)
  if (collegeName.includes("IIT Bombay")) {
    if (normExam === "MHT-CET") {
      return { isEligible: false, score: 0, reason: null };
    }
    if (parsedScore !== null) {
      if (parsedScore >= 99) {
        return {
          isEligible: true,
          score: WEIGHTS.EXAM_AND_CUTOFF_FIT,
          reason: `Matches your top JEE score (${parsedScore} percentile) for IIT Bombay (Requires JEE Advanced rank)`,
        };
      } else {
        // Below 99 percentile: IIT Bombay is not attainable
        return {
          isEligible: false,
          score: 0,
          reason: null,
        };
      }
    } else {
      // Score not provided yet by user, but student chose JEE Advanced
      if (normExam === "JEE Advanced") {
        return {
          isEligible: true,
          score: WEIGHTS.EXAM_AND_CUTOFF_FIT * 0.9,
          reason: "Premier national institute via JEE Advanced (Requires ~99+ percentile)",
        };
      }
      return { isEligible: false, score: 0, reason: null };
    }
  }

  // 3. SPECIAL HANDLING FOR VNIT NAGPUR
  // Criteria: 94+ percentile in JEE Mains
  if (collegeName.includes("VNIT")) {
    if (normExam === "MHT-CET") {
      return { isEligible: false, score: 0, reason: null };
    }
    if (parsedScore !== null) {
      if (parsedScore >= 94) {
        return {
          isEligible: true,
          score: WEIGHTS.EXAM_AND_CUTOFF_FIT,
          reason: `Matches your JEE Main score (${parsedScore} percentile) for VNIT Nagpur (94+ percentile criteria)`,
        };
      } else {
        // Below 94: Not competitive for VNIT Nagpur
        return {
          isEligible: false,
          score: 0,
          reason: null,
        };
      }
    } else {
      // Score not entered yet
      return {
        isEligible: true,
        score: WEIGHTS.EXAM_AND_CUTOFF_FIT * 0.85,
        reason: "National Institute of Technology (VNIT) via JEE Main (94+ percentile criteria)",
      };
    }
  }

  // 4. GENERAL EXAM ACCEPTANCE CHECK
  const acceptsExam =
    normExam === "JEE Advanced"
      ? acceptedExams.includes("JEE Main") || acceptedExams.includes("JEE Advanced")
      : acceptedExams.includes(normExam) || acceptedExams.length === 0;

  if (!acceptsExam) {
    return {
      isEligible: false,
      score: 0,
      reason: null,
    };
  }

  // 5. PERCENTILE / CUTOFF BENCHMARK MATCHING FOR MAHARASHTRA COLLEGES
  const benchmarkCutoff = getCollegeBenchmarkCutoff(collegeName, normExam);

  if (parsedScore === null) {
    return {
      isEligible: true,
      score: WEIGHTS.EXAM_AND_CUTOFF_FIT * 0.85,
      reason: `Accepts ${normExam} examination (${acceptedExams.join(", ")})`,
    };
  }

  const diff = parsedScore - (benchmarkCutoff || 75.0);

  if (diff >= 0) {
    // Score is at or above benchmark cutoff: Strong competitive fit!
    return {
      isEligible: true,
      score: WEIGHTS.EXAM_AND_CUTOFF_FIT,
      reason: `Your ${normExam} percentile (${parsedScore}) is competitive for this institute (est. cutoff ~${benchmarkCutoff}%)`,
    };
  } else if (diff >= -5) {
    // Within 5 percentile reach: Aspirational choice
    return {
      isEligible: true,
      score: WEIGHTS.EXAM_AND_CUTOFF_FIT * 0.65,
      reason: `Aspirational choice for your ${parsedScore} percentile (est. cutoff ~${benchmarkCutoff}%)`,
    };
  } else if (diff >= -12) {
    // Within 12 percentile reach: High reach
    return {
      isEligible: true,
      score: WEIGHTS.EXAM_AND_CUTOFF_FIT * 0.3,
      reason: null,
    };
  } else {
    // Far below cutoff: Unrealistic fit
    return {
      isEligible: true,
      score: 0,
      reason: null,
    };
  }
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
    return { score: WEIGHTS.BUDGET_MATCH * 0.5, matches: false };
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
    score = "",
    branches = [],
    budget = "any",
    hostel = "no-preference",
    location = "anywhere",
    autonomous = "no-preference",
    collegeType = "any",
    priorities = {},
  } = preferences;

  // Filter out colleges that are strictly ineligible for the selected entrance exam and score
  const eligibleColleges = rawColleges.filter((c) => {
    const check = evaluateExamAndCutoff(c, entranceExam, score);
    return check.isEligible;
  });

  const scoredColleges = eligibleColleges.map((collegeRaw) => {
    const college = sanitizeCollege(collegeRaw);
    let totalScore = 0;
    const reasons = [];

    // 1. Entrance Exam & Percentile Fit (Weight: 25)
    const examCheck = evaluateExamAndCutoff(college, entranceExam, score);
    totalScore += examCheck.score;
    if (examCheck.reason) {
      reasons.push(examCheck.reason);
    }

    // 2. Branch Preference Matching (Weight: 20)
    const branchCheck = branchMatches(college.Branches, branches);
    if (branchCheck.matches && branchCheck.matchedNames.length > 0) {
      totalScore += WEIGHTS.BRANCH_MATCH;
      const displayBranches = branchCheck.matchedNames.slice(0, 2).join(", ");
      reasons.push(`Offers your preferred branch (${displayBranches})`);
    } else if (branches.length === 0) {
      totalScore += WEIGHTS.BRANCH_MATCH * 0.8;
    }

    // 3. Budget Matching (Weight: 15)
    const budgetCheck = evaluateBudget(college.Fees, budget);
    totalScore += budgetCheck.score;
    if (budgetCheck.matches && college.Fees != null) {
      reasons.push(
        `Fits your budget (₹${Number(college.Fees).toLocaleString()}/year)`
      );
    }

    // 4. Location Matching (Weight: 15)
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
        `Located in your preferred area (${college.District || college.City})`
      );
    } else {
      totalScore += 2;
    }

    // 5. Hostel Matching (Weight: 10)
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

    // 6. Autonomous & College Type Matching (Weight: 5)
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
        totalScore += 2;
        reasons.push(`${college.Type} college`);
      }
    }

    // 7. Placement Performance (Weight: 5)
    const avgPackageNum = parseFloat(college["Avg package"]) || 0;
    const placementPctNum = parseFloat(college["Placement %"]) || 0;

    let placementScore = 0;
    if (avgPackageNum >= 10) placementScore += 2.5;
    else if (avgPackageNum >= 6) placementScore += 1.8;
    else if (avgPackageNum > 0) placementScore += 1;

    if (placementPctNum >= 80) placementScore += 2.5;
    else if (placementPctNum >= 65) placementScore += 1.8;
    else if (placementPctNum > 0) placementScore += 1;

    totalScore += placementScore;

    if (avgPackageNum >= 7 || placementPctNum >= 75) {
      reasons.push(
        `Strong placement record (${avgPackageNum ? `Avg ~${avgPackageNum} LPA` : ""}${
          placementPctNum ? `, ${placementPctNum}% placed` : ""
        })`
      );
    }

    // 8. Campus Life & Clubs (Weight: 5)
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

    // Cap totalScore at 98 (never 100 to emphasize guidance, not guaranteed outcome)
    const normalizedScore = Math.min(98, Math.max(20, Math.round(totalScore)));

    if (reasons.length === 0) {
      reasons.push("Accredited engineering institute in Maharashtra");
    }

    return {
      ...college,
      matchScore: normalizedScore,
      reasons: reasons.slice(0, 5),
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
    (c) => c.matchScore >= THRESHOLDS.RECOMMENDED_MIN_SCORE
  );
  const considerations = scoredColleges.filter(
    (c) =>
      c.matchScore >= THRESHOLDS.CONSIDERATION_MIN_SCORE &&
      c.matchScore < THRESHOLDS.RECOMMENDED_MIN_SCORE
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
  evaluateExamAndCutoff,
  COLLEGE_CUTOFF_BENCHMARKS,
};
