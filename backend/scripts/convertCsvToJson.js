const fs = require("fs");
const path = require("path");

const csvPath = "C:/Users/AFTAB/Downloads/Engineering.csv";
const outDir = path.join(__dirname, "..", "data");
const outPath = path.join(outDir, "defaultColleges.json");

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const csvText = fs.readFileSync(csvPath, "utf8");
const rawLines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);

const parseCSVLine = (line) => {
  const result = [];
  let current = "";
  let insideQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      insideQuotes = !insideQuotes;
    } else if (char === "," && !insideQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
};

const rawHeaders = parseCSVLine(rawLines[0]).map((h) =>
  h.replace(/^\uFEFF/, "").trim(),
);

const branchListCommon = [
  "Computer Engineering",
  "Information Technology",
  "Artificial Intelligence & Data Science",
  "Electronics & Telecommunication",
  "Mechanical Engineering",
  "Civil Engineering",
  "Electrical Engineering",
];

const colleges = [];

for (let i = 1; i < rawLines.length; i++) {
  const values = parseCSVLine(rawLines[i]);
  if (values.length < rawHeaders.length) continue;

  const doc = {};
  rawHeaders.forEach((header, idx) => {
    let val = values[idx] !== undefined ? values[idx] : "";
    if (header === "College") {
      doc.College = val;
    } else if (header === "Fees") {
      doc.Fees =
        val === "N/A" || val === ""
          ? null
          : Number(val.replace(/,/g, "")) || null;
    } else if (header === "Avg package") {
      doc["Avg package"] = val.replace("+", "").trim();
    } else if (header === "Placement %") {
      doc["Placement %"] = val === "N/A" || val === "" ? null : val;
    } else {
      doc[header] = val;
    }
  });

  // Attach realistic accepted exams & branches based on college type
  if (doc.College.includes("IIT Bombay")) {
    doc["Exams Accepted"] = ["JEE Advanced"];
    doc.Branches = [
      "Computer Science and Engineering",
      "Electrical Engineering",
      "Mechanical Engineering",
      "Aerospace Engineering",
      "Civil Engineering",
      "Chemical Engineering",
    ];
  } else if (doc.College.includes("VNIT")) {
    doc["Exams Accepted"] = ["JEE Main"];
    doc.Branches = [
      "Computer Science and Engineering",
      "Electronics and Communication",
      "Electrical and Electronics",
      "Mechanical Engineering",
      "Civil Engineering",
      "Chemical Engineering",
    ];
  } else if (doc.College.includes("ICT")) {
    doc["Exams Accepted"] = ["MHT-CET", "JEE Main"];
    doc.Branches = [
      "Chemical Engineering",
      "Food Engineering and Technology",
      "Pharmaceuticals Chemistry and Technology",
      "Polymer and Surface Engineering",
    ];
  } else {
    doc["Exams Accepted"] = ["MHT-CET", "JEE Main"];
    doc.Branches = branchListCommon;
  }

  colleges.push(doc);
}

fs.writeFileSync(outPath, JSON.stringify(colleges, null, 2), "utf8");
console.log(`Successfully converted ${colleges.length} colleges to ${outPath}`);
