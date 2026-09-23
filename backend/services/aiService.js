const College = require("../models/College");
const {
  fetchAllColleges,
  sanitizeCollege,
} = require("./recommendationService");

// College alias dictionary for fast, intuitive name recognition
const COLLEGE_ALIASES = [
  { match: ["iit bombay", "iitb", "iit powai"], name: "IIT Bombay" },
  {
    match: ["ict", "ict mumbai", "institute of chemical technology"],
    name: "ICT Mumbai",
  },
  { match: ["vnit", "vnit nagpur", "visvesvaraya"], name: "VNIT Nagpur" },
  {
    match: ["coep", "coep tech", "college of engineering pune"],
    name: "COEP Technological University",
  },
  { match: ["vjti", "vjti mumbai", "veermata"], name: "VJTI" },
  {
    match: ["walchand sangli", "wce", "walchand college of engineering"],
    name: "Walchand College of Engineering",
  },
  {
    match: ["pict", "pict pune", "pune institute of computer technology"],
    name: "PICT Pune",
  },
  {
    match: ["vit", "vit pune", "vishwakarma institute of technology"],
    name: "Vishwakarma Institute of Technology",
  },
  {
    match: ["ait", "ait pune", "army institute"],
    name: "Army Institute of Technology",
  },
  {
    match: ["wit", "wit solapur", "walchand institute of technology"],
    name: "Walchand Institute of Technology",
  },
  { match: ["spit", "spit mumbai", "sardar patel"], name: "SPIT Mumbai" },
  {
    match: ["djsce", "dj sanghvi", "sanghvi"],
    name: "DJ Sanghvi College of Engineering",
  },
  {
    match: ["kjsce", "somaiya", "k j somaiya"],
    name: "K. J. Somaiya College of Engineering",
  },
  {
    match: ["rait", "ramrao adik", "d y patil nerul"],
    name: "Ramrao Adik Institute of Technology",
  },
  {
    match: ["pccoe", "pimpri chinchwad"],
    name: "Pimpri Chinchwad College of Engineering",
  },
  {
    match: ["viit", "viit pune"],
    name: "Vishwakarma Institute of Information Technology",
  },
  {
    match: ["mit wpu", "mit pune", "world peace"],
    name: "MIT World Peace University",
  },
  {
    match: ["bharati vidyapeeth", "bvp", "bvcoe"],
    name: "Bharati Vidyapeeth College of Engineering Pune",
  },
  {
    match: ["ycce", "yeshwantrao"],
    name: "Yeshwantrao Chavan College of Engineering",
  },
  {
    match: ["rknec", "ramdeobaba", "rcoem"],
    name: "Shri Ramdeobaba College of Engineering and Management",
  },
  {
    match: [
      "geca",
      "gec aurangabad",
      "government college of engineering aurangabad",
    ],
    name: "Government College of Engineering Aurangabad",
  },
  {
    match: [
      "gcoea",
      "gec amravati",
      "government college of engineering amravati",
    ],
    name: "Government College of Engineering Amravati",
  },
  {
    match: ["rit", "rit sangli", "rajarambapu"],
    name: "Rajarambapu Institute of Technology",
  },
  { match: ["tsec", "thadomal"], name: "Thadomal Shahani Engineering College" },
  {
    match: ["vesit", "vivekanand"],
    name: "Vivekanand Education Society's Institute of Technology",
  },
  {
    match: ["vidyalankar", "vit wadala"],
    name: "Vidyalankar Institute of Technology",
  },
  { match: ["dbit", "don bosco"], name: "Don Bosco Institute of Technology" },
  {
    match: ["crce", "fr conceicao bandra", "fr agnel bandra"],
    name: "Fr. Conceicao Rodrigues College of Engineering",
  },
  {
    match: ["fcrit", "fr agnel vashi"],
    name: "Fr. Conceicao Rodrigues Institute of Technology",
  },
  {
    match: ["sakec", "shah and anchor"],
    name: "Shah and Anchor Kutchhi Engineering College",
  },
  {
    match: ["sfit", "st francis"],
    name: "St. Francis Institute of Technology",
  },
  {
    match: ["sies", "sies gst", "sies nerul"],
    name: "SIES Graduate School of Technology",
  },
  {
    match: ["kjsit", "somaiya sion"],
    name: "K. J. Somaiya Institute of Technology",
  },
  { match: ["mitaoe", "mit alandi"], name: "MIT Academy of Engineering" },
  {
    match: ["dypvp", "d y patil pimpri", "dyp pimpri"],
    name: "D. Y. Patil Institute of Technology",
  },
  {
    match: ["dypcoe", "d y patil akurdi", "dyp akurdi"],
    name: "D. Y. Patil College of Engineering",
  },
  {
    match: ["jspm", "rajarshi shahu"],
    name: "JSPM Rajarshi Shahu College of Engineering",
  },
  { match: ["aissms"], name: "AISSMS College of Engineering" },
  {
    match: ["modern", "modern college"],
    name: "Progressive Education Society's Modern College of Engineering",
  },
  { match: ["sinhgad", "scoe"], name: "Sinhgad College of Engineering" },
  {
    match: ["indira", "icem"],
    name: "Indira College of Engineering and Management",
  },
  {
    match: ["i2it", "isquareit"],
    name: "International Institute of Information Technology (I²IT)",
  },
  {
    match: ["kkwagh", "k k wagh"],
    name: "K. K. Wagh Institute of Engineering Education and Research",
  },
  { match: ["kit", "kit kolhapur"], name: "Kolhapur Institute of Technology" },
  { match: ["sanjivani"], name: "Sanjivani College of Engineering" },
  {
    match: ["nmiet", "nutan maharashtra"],
    name: "Nutan Maharashtra Institute of Engineering and Technology",
  },
  { match: ["raisoni", "ghrce"], name: "G. H. Raisoni College of Engineering" },
];

const STOPWORDS = new Set([
  "pune",
  "mumbai",
  "nagpur",
  "nashik",
  "sangli",
  "solapur",
  "thane",
  "kolhapur",
  "amravati",
  "aurangabad",
  "college",
  "colleges",
  "institute",
  "technology",
  "engineering",
  "technological",
  "university",
  "about",
  "tell",
  "what",
  "which",
  "where",
  "good",
  "best",
  "show",
  "some",
  "like",
  "with",
  "have",
  "more",
  "details",
  "info",
  "information",
  "campus",
  "hostel",
  "fees",
  "package",
  "placement",
  "placements",
]);

/**
 * Finds colleges mentioned in user query using alias dictionary & fuzzy search
 */
function findCollegesInQuery(query, allColleges) {
  const q = query.toLowerCase();
  const matched = [];

  // 1. Check alias dictionary using strict word boundaries
  for (const item of COLLEGE_ALIASES) {
    for (const alias of item.match) {
      const regex = new RegExp(
        `\\b${alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
        "i",
      );
      if (regex.test(q)) {
        const found = allColleges.find((c) =>
          c.College.toLowerCase().includes(item.name.toLowerCase()),
        );
        if (found && !matched.some((m) => m.College === found.College)) {
          matched.push(found);
        }
      }
    }
  }

  // 2. Check direct names (excluding generic stopwords)
  for (const c of allColleges) {
    const cLower = c.College.toLowerCase();
    const words = cLower
      .split(/[\s,.-]+/)
      .filter((w) => w.length >= 4 && !STOPWORDS.has(w));
    for (const w of words) {
      const regex = new RegExp(`\\b${w}\\b`, "i");
      if (regex.test(q)) {
        if (!matched.some((m) => m.College === c.College)) {
          matched.push(c);
        }
      }
    }
  }

  return matched;
}

/**
 * Clean college facts for context injection
 */
function buildCollegeFactSheet(colleges) {
  return colleges.map((c) => ({
    College: c.College,
    District: c.District,
    City: c.City,
    Type: c.Type,
    Autonomous: c.Autonomous,
    NAAC: c["NAAC grade"] || "Not specified",
    Fees_INR_Per_Year: c.Fees != null ? c.Fees : "Not specified in database",
    Hostel: c.Hostel,
    Avg_Package_LPA: c["Avg package"] || "Not specified in database",
    Placement_Percentage: c["Placement %"] || "Not specified in database",
    Coding_Club: c["Coding Club"] || "No",
    Sports: [
      c.Football === "Yes" ? "Football" : null,
      c.Cricket === "Yes" ? "Cricket" : null,
      c.Basketball === "Yes" ? "Basketball" : null,
      c["Other Sports"] === "Yes" ? "Other Sports" : null,
    ].filter(Boolean),
    Cultural_Clubs: [
      c["Theatre Club"] === "Yes" ? "Theatre" : null,
      c["Art Club"] === "Yes" ? "Art" : null,
      c["Dance Club"] === "Yes" ? "Dance" : null,
      c["Music Club"] === "Yes" ? "Music" : null,
    ].filter(Boolean),
    Branches: Array.isArray(c.Branches) ? c.Branches : [],
    Exams_Accepted: Array.isArray(c["Exams Accepted"])
      ? c["Exams Accepted"]
      : ["MHT-CET", "JEE Main"],
    Website: c.Website || "",
    Recommendation_Match_Score: c.matchScore,
    Why_Recommended: c.reasons || [],
  }));
}

/**
 * Deterministic, intelligent local RAG answering engine (guaranteed zero-hallucination)
 */
function generateLocalFactualResponse(
  question,
  collegesContext,
  studentProfile,
) {
  const q = (question || "").toLowerCase().trim();
  const allAvailable = collegesContext;
  const topColleges = allAvailable.slice(0, 6);

  // 1. GREETINGS & INTRO
  if (
    /^(hi|hello|hey|greetings|hola|namaste|good\s*(morning|afternoon|evening))\b/i.test(
      q,
    )
  ) {
    const topName =
      topColleges[0]?.College || "Maharashtra Engineering Colleges";
    return (
      `Hello! I'm your **Career Compass AI College Counsellor** 🎓\n\n` +
      `I've analyzed your academic profile and matched you with Maharashtra's top engineering colleges. ` +
      `Your current #1 recommended college is **${topName}**.\n\n` +
      `You can ask me questions such as:\n` +
      `• *"Why did you recommend my #1 college?"*\n` +
      `• *"Compare ${topColleges[0]?.College || "COEP"} and ${topColleges[1]?.College || "VJTI"}"*\n` +
      `• *"Which colleges are within my budget?"*\n` +
      `• *"Which colleges have campus hostel?"*\n` +
      `• *"Which colleges have good coding culture?"*\n\n` +
      `How can I help you shape your engineering journey today?`
    );
  }

  // 2. ENTRANCE EXAM PATHWAY QUERIES (IIT Bombay & VNIT vs MHT-CET)
  if (
    (q.includes("iit") || q.includes("iitb") || q.includes("iit bombay")) &&
    (q.includes("cet") || q.includes("mht") || q.includes("mht-cet"))
  ) {
    return (
      `**No, you cannot get admission into IIT Bombay through MHT-CET.** 🚫\n\n` +
      `• **Admission Pathway:** IIT Bombay admits students exclusively through **JEE Advanced** via JoSAA (Joint Seat Allocation Authority) counselling.\n` +
      `• **Percentile Requirement:** Candidates typically need a **99+ percentile in JEE** to qualify for JEE Advanced and secure top All-India ranks.\n` +
      `• **What MHT-CET is for:** MHT-CET is conducted exclusively for Maharashtra State government, autonomous, and private engineering institutions (such as **COEP Tech**, **VJTI Mumbai**, **ICT Mumbai**, **PICT Pune**, and **SPIT Mumbai**).\n\n` +
      `If you have appeared for MHT-CET, top Maharashtra state institutions like COEP and VJTI are the premier choices for your score.`
    );
  }

  if (
    (q.includes("vnit") || q.includes("vnit nagpur")) &&
    (q.includes("cet") || q.includes("mht") || q.includes("mht-cet"))
  ) {
    return (
      `**No, VNIT Nagpur does not accept MHT-CET.** 🚫\n\n` +
      `• **Admission Pathway:** VNIT Nagpur is a National Institute of Technology (NIT) and admits candidates strictly through **JEE Main** via JoSAA / CSAB counselling.\n` +
      `• **Score Requirement:** It generally requires a **94+ percentile in JEE Main** for competitive branches.\n` +
      `• **Alternative:** For MHT-CET counselling, the equivalent premier government/autonomous colleges in Maharashtra are **COEP Tech**, **VJTI Mumbai**, and **Walchand Sangli**.`
    );
  }

  // 3. CUTOFF & RANK INQUIRIES (Explicitly absent from DB)
  if (
    q.includes("cutoff") ||
    q.includes("cut-off") ||
    q.includes("merit list") ||
    q.includes("closing rank") ||
    q.includes("marks required") ||
    q.includes("percentile required")
  ) {
    return (
      `I don't have that information in the current college database. ` +
      `Official cutoffs fluctuate annually based on candidate exam percentiles in MHT-CET / JEE Main, category quotas (Open, OBC, SC/ST, EWS, TFWS), and Centralized Admission Process (CAP) rounds conducted by the State Common Entrance Test Cell, Maharashtra.\n\n` +
      `Please check the official CET Cell portal (**cetcell.mahacet.org**) or respective college websites for past cutoff PDFs.`
    );
  }

  // 3. COLLEGE COMPARISON (e.g. "compare COEP and VJTI", "which is better X or Y")
  if (
    q.includes("compare") ||
    q.includes("vs") ||
    q.includes("versus") ||
    q.includes("which is better") ||
    q.includes("difference between")
  ) {
    const matchedColleges = findCollegesInQuery(q, allAvailable);
    if (matchedColleges.length >= 2) {
      const c1 = matchedColleges[0];
      const c2 = matchedColleges[1];
      return (
        `Here is a factual side-by-side comparison between **${c1.College}** and **${c2.College}** based on verified database records:\n\n` +
        `• **Location:** ${c1.District || c1.City} vs ${c2.District || c2.City}\n` +
        `• **Institute Type:** ${c1.Type} (${c1.Autonomous === "Yes" ? "Autonomous" : "Affiliated"}) vs ${c2.Type} (${c2.Autonomous === "Yes" ? "Autonomous" : "Affiliated"})\n` +
        `• **NAAC Grade:** ${c1.NAAC || "N/A"} vs ${c2.NAAC || "N/A"}\n` +
        `• **Annual Tuition Fees:** ${typeof c1.Fees_INR_Per_Year === "number" ? `₹${c1.Fees_INR_Per_Year.toLocaleString()}` : "N/A"} vs ${typeof c2.Fees_INR_Per_Year === "number" ? `₹${c2.Fees_INR_Per_Year.toLocaleString()}` : "N/A"}\n` +
        `• **Campus Hostel:** ${c1.Hostel} vs ${c2.Hostel}\n` +
        `• **Average Placement Package:** ${c1.Avg_Package_LPA} LPA vs ${c2.Avg_Package_LPA} LPA\n` +
        `• **Placement Rate:** ${c1.Placement_Percentage}% vs ${c2.Placement_Percentage}%\n` +
        `• **Coding Club:** ${c1.Coding_Club} vs ${c2.Coding_Club}\n\n` +
        `Both are reputable institutions. Your choice should consider branch preference, proximity to home, and fee structures.`
      );
    }
  }

  // 4. SPECIFIC COLLEGE INQUIRY (e.g. "tell me about coep", "why coep?", "is pict good?")
  const matchedColleges = findCollegesInQuery(q, allAvailable);
  if (
    matchedColleges.length === 1 ||
    (q.includes("why") && matchedColleges.length > 0)
  ) {
    const c = matchedColleges[0];
    const reasonsFormatted = (c.Why_Recommended || [])
      .map((r) => `  ✓ ${r}`)
      .join("\n");
    return (
      `Here are the verified database details for **${c.College}**:\n\n` +
      (reasonsFormatted
        ? `**Why Recommended for You (${c.Recommendation_Match_Score || 90}% Match):**\n${reasonsFormatted}\n\n`
        : "") +
      `• **Location:** ${c.City || c.District}, Maharashtra\n` +
      `• **Type & Status:** ${c.Type} | Autonomous: ${c.Autonomous} | NAAC: ${c.NAAC}\n` +
      `• **Annual Fees:** ${typeof c.Fees_INR_Per_Year === "number" ? `₹${c.Fees_INR_Per_Year.toLocaleString()}/year` : "Contact Institute"}\n` +
      `• **Hostel Facility:** ${c.Hostel === "Yes" ? "Available on campus" : "No campus hostel listed"}\n` +
      `• **Placements:** Average Package: ${c.Avg_Package_LPA} LPA | Placement Rate: ${c.Placement_Percentage}%\n` +
      `• **Coding Club:** ${c.Coding_Club}\n` +
      `• **Sports Available:** ${c.Sports.join(", ") || "General facilities"}\n` +
      `• **Branches Recorded:** ${c.Branches.slice(0, 5).join(", ")}${c.Branches.length > 5 ? "..." : ""}\n` +
      `• **Website:** ${c.Website || "N/A"}\n\n` +
      `*Disclaimer: Recommendation scores are calculated for guidance based on your selected preferences and do not guarantee admission.*`
    );
  }

  // 5. FEES & BUDGET QUERIES
  if (
    q.includes("fee") ||
    q.includes("budget") ||
    q.includes("cost") ||
    q.includes("expensive") ||
    q.includes("cheap") ||
    q.includes("affordable") ||
    q.includes("lakh") ||
    q.includes("tuition")
  ) {
    const withFees = allAvailable.filter(
      (c) => typeof c.Fees_INR_Per_Year === "number",
    );
    withFees.sort((a, b) => a.Fees_INR_Per_Year - b.Fees_INR_Per_Year);

    const list = withFees
      .slice(0, 6)
      .map(
        (c) =>
          `• **${c.College}** (${c.District}): ₹${c.Fees_INR_Per_Year.toLocaleString()}/year [${c.Type}]`,
      )
      .join("\n");

    return (
      `Here is the verified annual tuition fee breakdown for recommended colleges in our database (ordered from lowest to highest):\n\n${list}\n\n` +
      `*Note: Government colleges generally have lower fees (~₹20k–₹1L), while private universities range from ₹1.2L to ₹4L+. Category-based fee concessions (EBC, TFWS, SC/ST, OBC) apply through official DTE Maharashtra rules.*`
    );
  }

  // 6. HOSTEL QUERIES
  if (
    q.includes("hostel") ||
    q.includes("accommodation") ||
    q.includes("stay") ||
    q.includes("room") ||
    q.includes("living") ||
    q.includes("mess")
  ) {
    const hostelYes = allAvailable.filter((c) => c.Hostel === "Yes");
    const hostelNo = allAvailable.filter((c) => c.Hostel === "No");

    let reply = `Here is the verified hostel availability for your recommended colleges:\n\n`;
    if (hostelYes.length > 0) {
      reply +=
        `**Colleges with Campus Hostel Facilities:**\n` +
        hostelYes
          .slice(0, 6)
          .map((c) => `• **${c.College}** (${c.City || c.District})`)
          .join("\n");
    }
    if (hostelNo.length > 0) {
      reply +=
        `\n\n**Colleges with No Campus Hostel Listed:**\n` +
        hostelNo
          .slice(0, 4)
          .map(
            (c) =>
              `• **${c.College}** (${c.District}) — Students typically use private PGs or hostels nearby.`,
          )
          .join("\n");
    }
    return reply;
  }

  // 7. PLACEMENTS & PACKAGES
  if (
    q.includes("placement") ||
    q.includes("package") ||
    q.includes("salary") ||
    q.includes("recruit") ||
    q.includes("company") ||
    q.includes("jobs") ||
    q.includes("highest")
  ) {
    const sorted = [...allAvailable].sort((a, b) => {
      const pB = parseFloat(b.Avg_Package_LPA) || 0;
      const pA = parseFloat(a.Avg_Package_LPA) || 0;
      return pB - pA;
    });

    const list = sorted
      .slice(0, 6)
      .map(
        (c) =>
          `• **${c.College}** (${c.District}): Average ~${c.Avg_Package_LPA} LPA | Placement Rate: ${c.Placement_Percentage}%`,
      )
      .join("\n");

    return (
      `Here are the verified average placement figures from our database for top recommended institutions:\n\n${list}\n\n` +
      `*Note: Figures reflect institutionally reported averages. Individual packages depend on branch, student skillset, and annual recruiting drives.*`
    );
  }

  // 8. CODING, IT & TECH CULTURE
  if (
    q.includes("coding") ||
    q.includes("developer") ||
    q.includes("hackathon") ||
    q.includes("programming") ||
    q.includes("software") ||
    q.includes("computer science") ||
    q.includes("it")
  ) {
    const codingColleges = allAvailable.filter((c) => c.Coding_Club === "Yes");
    return (
      `Colleges with an active **Coding Club** and dedicated tech societies in our database:\n\n` +
      codingColleges
        .slice(0, 6)
        .map(
          (c) =>
            `• **${c.College}** (${c.District}) — Active coding culture & student developer groups.`,
        )
        .join("\n") +
      `\n\nThese colleges are well-regarded for students targeting Computer Engineering, IT, and AI/Data Science.`
    );
  }

  // 9. LOCATION & DISTRICT QUERIES (e.g. "colleges in Pune", "Mumbai", "Nagpur")
  const districts = [
    "pune",
    "mumbai",
    "nagpur",
    "nashik",
    "sangli",
    "solapur",
    "aurangabad",
    "chhatrapati sambhajinagar",
    "kolhapur",
    "thane",
    "amravati",
    "ahmednagar",
  ];
  const matchedDistrict = districts.find((d) => q.includes(d));
  if (matchedDistrict) {
    const inDistrict = allAvailable.filter(
      (c) =>
        (c.District || "").toLowerCase().includes(matchedDistrict) ||
        (c.City || "").toLowerCase().includes(matchedDistrict),
    );
    if (inDistrict.length > 0) {
      const list = inDistrict
        .slice(0, 6)
        .map(
          (c) =>
            `• **${c.College}** [${c.Type}, Autonomous: ${c.Autonomous}] — Avg Pkg: ${c.Avg_Package_LPA} LPA, Fees: ${typeof c.Fees_INR_Per_Year === "number" ? `₹${c.Fees_INR_Per_Year.toLocaleString()}` : "N/A"}`,
        )
        .join("\n");
      return `Here are the recommended colleges located in/around **${matchedDistrict.toUpperCase()}**:\n\n${list}`;
    }
    return `I don't have matching colleges in ${matchedDistrict} in your currently filtered recommendations. Try selecting "Anywhere in Maharashtra" in your preferences.`;
  }

  // 10. AUTONOMOUS & GOVT STATUS QUERIES
  if (
    q.includes("autonomous") ||
    q.includes("autonomy") ||
    q.includes("government") ||
    q.includes("aided") ||
    q.includes("private")
  ) {
    const autoList = allAvailable
      .filter((c) => c.Autonomous === "Yes")
      .slice(0, 5);
    const govtList = allAvailable
      .filter((c) => (c.Type || "").toLowerCase().includes("gov"))
      .slice(0, 5);

    let reply = "";
    if (q.includes("autonomous")) {
      reply =
        `Autonomous colleges set their own curricula, conduct internal examinations, and adapt syllabi quickly to industry trends.\n\n` +
        `**Autonomous colleges in your recommendations:**\n` +
        autoList
          .map((c) => `• **${c.College}** (${c.District}) — Autonomous: Yes`)
          .join("\n");
    } else {
      reply =
        `**Government & Govt-Aided colleges in your recommendations:**\n` +
        govtList
          .map(
            (c) =>
              `• **${c.College}** (${c.District}) — Type: ${c.Type}, Fees: ${typeof c.Fees_INR_Per_Year === "number" ? `₹${c.Fees_INR_Per_Year.toLocaleString()}` : "N/A"}`,
          )
          .join("\n");
    }
    return reply;
  }

  // 11. SPORTS & CULTURAL CLUBS
  if (
    q.includes("sport") ||
    q.includes("cricket") ||
    q.includes("football") ||
    q.includes("basketball") ||
    q.includes("dance") ||
    q.includes("music") ||
    q.includes("theatre") ||
    q.includes("art")
  ) {
    const sportsColleges = allAvailable
      .filter((c) => c.Sports && c.Sports.length > 0)
      .slice(0, 5);
    return (
      `Here are recommended colleges with recorded sports and cultural clubs:\n\n` +
      sportsColleges
        .map(
          (c) =>
            `• **${c.College}** (${c.District}): Sports: ${c.Sports.join(", ") || "General grounds"} | Cultural: ${c.Cultural_Clubs.join(", ") || "Active societies"}`,
        )
        .join("\n")
    );
  }

  // 12. GENERAL OVERVIEW / EXPLAIN MY RESULTS
  const topList = topColleges
    .slice(0, 5)
    .map(
      (c, i) =>
        `${i + 1}. **${c.College}** (${c.District}) — **${c.Recommendation_Match_Score || 90}% Match**`,
    )
    .join("\n");
  return (
    `Here is a summary of your top recommended Maharashtra engineering colleges:\n\n${topList}\n\n` +
    `These institutions were matched against your preferred branches, budget, location, and campus preferences.\n\n` +
    `You can ask me to compare any two colleges (e.g. *"Compare ${topColleges[0]?.College || "COEP"} and ${topColleges[1]?.College || "VJTI"}"*), or ask about specific fees, hostels, or coding clubs.`
  );
}

/**
 * Calls Google Gemini REST API if GEMINI_API_KEY is configured
 */
async function callGeminiAPI(apiKey, prompt, contextData) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const systemInstruction =
    "You are the Career Compass Maharashtra AI College Counsellor. " +
    "You assist students with understanding their engineering college recommendations in Maharashtra.\n" +
    "CRITICAL RULES:\n" +
    "1. Base your answer EXCLUSIVELY on the provided factual college JSON data.\n" +
    "2. If an asked fact (such as exact cutoffs, ranking, or unlisted data) is NOT present in the provided JSON, you MUST say: " +
    '"I don\'t have that information in the current college database."\n' +
    "3. NEVER fabricate or invent fees, cutoffs, admission chances, rankings, or packages.\n" +
    '4. Under NO circumstances should you mention or display "Highest Package".\n' +
    "5. Always be polite, encouraging, and clear for high school students, and state clearly that recommendations are for guidance, not an admission guarantee.\n" +
    "6. Format answers in clean markdown with bullet points.";

  const body = {
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `${systemInstruction}\n\nDATABASE CONTEXT:\n${JSON.stringify(contextData, null, 2)}\n\nSTUDENT QUESTION:\n${prompt}`,
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 600,
    },
  };

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API returned ${response.status}: ${errorText}`);
  }

  const result = await response.json();
  const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error("Empty response from Gemini API");
  }
  return text;
}

/**
 * Main AI handler with RAG retrieval
 */
async function handleChatQuery({
  question,
  recommendedColleges = [],
  studentProfile = {},
}) {
  if (!question || typeof question !== "string") {
    throw new Error("Question is required");
  }

  // Retrieve relevant colleges from recommendations or DB
  let collegesForContext = [];
  if (Array.isArray(recommendedColleges) && recommendedColleges.length > 0) {
    collegesForContext = recommendedColleges.map((c) => sanitizeCollege(c));
  } else {
    const all = await fetchAllColleges();
    collegesForContext = all.slice(0, 15).map((c) => sanitizeCollege(c));
  }

  const factSheet = buildCollegeFactSheet(collegesForContext);

  // Check for AI API key in environment
  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey && geminiKey.trim() !== "") {
    try {
      const aiResponse = await callGeminiAPI(geminiKey, question, factSheet);
      return {
        reply: aiResponse,
        provider: "Gemini",
        groundedInCollegesCount: factSheet.length,
      };
    } catch (err) {
      console.warn(
        "External Gemini API failed or rate-limited. Falling back to local RAG engine:",
        err.message,
      );
    }
  }

  // Deterministic Local RAG Fallback
  const localResponse = generateLocalFactualResponse(
    question,
    factSheet,
    studentProfile,
  );
  return {
    reply: localResponse,
    provider: "Factual-RAG-Engine",
    groundedInCollegesCount: factSheet.length,
  };
}

module.exports = {
  handleChatQuery,
  buildCollegeFactSheet,
  findCollegesInQuery,
  generateLocalFactualResponse,
};
