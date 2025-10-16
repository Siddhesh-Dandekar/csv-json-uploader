import dotenv from "dotenv";
dotenv.config();

import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import cors from "cors";

const upload = multer({ dest: "uploads/" });
const app = express();
app.use(cors());
const port = process.env.PORT || 3001;

function parseCSVLine(line) {
  return line.split(",").map((x) => x.trim());
}

function deepAssign(obj, keys, value) {
  let cur = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    if (!cur[keys[i]]) cur[keys[i]] = {};
    cur = cur[keys[i]];
  }
  cur[keys.at(-1)] = value;
}

app.post("/api/upload", upload.single("csv"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded." });

  const filePath = path.resolve(req.file.path);

  try {
    // Read and parse CSV
    const content = fs
      .readFileSync(filePath, "utf-8")
      .split("\n")
      .filter(Boolean);

    if (content.length < 2)
      return res.status(400).json({ error: "CSV missing data." });

    const headers = parseCSVLine(content[0]);
    const results = [];

    for (let i = 1; i < content.length; i++) {
      const row = parseCSVLine(content[i]);
      const obj = {};
      for (let col = 0; col < row.length; col++) {
        const keys = headers[col].split(".");
        deepAssign(obj, keys, row[col]);
      }
      results.push(obj);
    }

    // Compute simple age distribution if `age` exists
    const dist = { 20: 0, "20-40": 0, "40-60": 0, "60+": 0 };
    results.forEach((r) => {
      const age = parseInt(r?.age);
      if (!age || isNaN(age)) return;
      if (age < 20) dist["20"]++;
      else if (age < 40) dist["20-40"]++;
      else if (age < 60) dist["40-60"]++;
      else dist["60+"]++;
    });

    // Clean up temp file
    fs.unlinkSync(filePath);

    // Return summary
    return res.json({
      totalRows: results.length,
      ageDistribution: dist,
      dataPreview: results.slice(0, 5),
    });
  } catch (error) {
    console.error("Processing error:", error);
    return res.status(500).json({ error: "File processing failed." });
  }
});

app.get("/", (req, res) => res.send("CSV to JSON Backend Running (No DB)"));

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
