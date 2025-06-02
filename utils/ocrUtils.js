// const Tesseract = require("tesseract.js");
// const Poppler = require("pdf-poppler");
// const path = require("path");
// const fs = require("fs");

// const convertPdfToImages = async (pdfPath) => {
//   const outputDir = path.dirname(pdfPath);
//   const options = {
//     format: "jpeg",
//     out_dir: outputDir,
//     out_prefix: path.basename(pdfPath, path.extname(pdfPath)),
//     page: null,
//   };

//   await Poppler.convert(pdfPath, options);
//   return fs.readdirSync(outputDir)
//     .filter(f => f.includes(options.out_prefix) && f.endsWith(".jpg"))
//     .map(f => path.join(outputDir, f));
// };

// const extractTextFromImages = async (imagePaths) => {
//   let fullText = "";
//   for (const img of imagePaths) {
//     const { data: { text } } = await Tesseract.recognize(img, "eng");
//     fullText += text + "\n";
//   }
//   return fullText;
// };

// module.exports = {
//   convertPdfToImages,
//   extractTextFromImages,
// };


const Tesseract = require("tesseract.js");
const Poppler = require("pdf-poppler");
const path = require("path");
const fs = require("fs");
const stringSimilarity = require('string-similarity');

const convertPdfToImages = async (pdfPath) => {
  const outputDir = path.dirname(pdfPath);
  const options = {
    format: "jpeg",
    out_dir: outputDir,
    out_prefix: path.basename(pdfPath, path.extname(pdfPath)),
    page: null,
  };

  await Poppler.convert(pdfPath, options);
  return fs.readdirSync(outputDir)
    .filter(f => f.includes(options.out_prefix) && f.endsWith(".jpg"))
    .map(f => path.join(outputDir, f));
};



const fuzzyMatch = (text, possibleValues, threshold = 0.6) => {
  let bestMatch = stringSimilarity.findBestMatch(text.toLowerCase(), possibleValues.map(v => v.toLowerCase()));
  return bestMatch.bestMatch.rating >= threshold ? bestMatch.bestMatch.target : null;
};

// Optimized metadata extraction function
const extractMetadata = (text) => {
  const metadata = {
    courseTitle: "Unknown",
    courseCode: "Unknown",
    maxMarks: "Unknown",
    maxTime: "Unknown",
    examType: "Unknown",
    year: "Unknown",
  };

  // Normalize text (remove extra spaces, artifacts)
  const cleanedText = text.replace(/[\s]+/g, " ").trim();

  // **Limit to first 80 words**
  const first80Words = cleanedText.split(/\s+/).slice(0, 80).join(" ");

  // Expected keywords for fuzzy matching
  const possibleTitles = ["Course Title", "Title", "Course Name"];
  const possibleCodes = ["Course Code", "Subject Code"];
  const possibleMarks = ["Maximum Marks", "Marks"];
  const possibleTimes = ["Maximum Time", "Duration"];
  const possibleExams = ["End Term", "Mid Term", "T1", "T2"];
  const possibleYears = ["Year", "Session", "Exam Year"];

  // **Word Proximity Matching**
  const findMetadata = (keywordList, pattern) => {
    const match = first80Words.match(pattern);
    if (!match || match.length < 3) return "Unknown"; // Prevent undefined errors
    return fuzzyMatch(match[1], keywordList) ? match[2].trim() : "Unknown";
  };

  // Extract metadata using word proximity & fuzzy matching
  metadata.courseTitle = findMetadata(possibleTitles, /(.+?)\s*[:\-]\s*(.+?)\s+Maximum\s*Time/i);
  metadata.courseCode = findMetadata(possibleCodes, /(.+?)\s*[:\-]\s*([\w\d]+)/i);
  metadata.maxMarks = findMetadata(possibleMarks, /(.+?)\s*[:\-]\s*(\d+)/i);
  metadata.maxTime = findMetadata(possibleTimes, /(.+?)\s*[:\-]\s*(\d+\s*hrs?|\d+\s*min)/i);
  metadata.examType = findMetadata(possibleExams, /(End\s*Term|Mid\s*Term|T1|T2)/i);
  metadata.year = findMetadata(possibleYears, /(\d{4}(?:-\d{2})?)/);

  return metadata;
};





const extractTextFromImages = async (imagePaths) => {
  let fullText = "";
  let totalConfidence = 0;
  let pageCount = 0;

  for (const img of imagePaths) {
    const { data } = await Tesseract.recognize(img, "eng");
    fullText += data.text + "\n";
    totalConfidence += data.confidence || 0;
    pageCount++;
  }

  const averageConfidence = pageCount > 0 ? (totalConfidence / pageCount).toFixed(2) : 0;
  const metadata = extractMetadata(fullText);

  return {
    text: fullText.trim(),
    metadata,
    confidenceScore: parseFloat(averageConfidence),
  };
};




function validateMetadataWithOCR(metadata, ocrData) {
  const errors = [];

  // ---- Course Title & Code Similarity ----
  const titleSimilarity = stringSimilarity.compareTwoStrings(
    ocrData.name?.toLowerCase() || '',
    metadata.courseTitle?.toLowerCase() || ''
  );

  const codeSimilarity = stringSimilarity.compareTwoStrings(
    ocrData.code?.toLowerCase() || '',
    metadata.courseCode?.toLowerCase() || ''
  );

  const courseDetailValidation = (titleSimilarity >= 0.75 || codeSimilarity >= 0.6) ? 1 : 0;
  if (!courseDetailValidation) {
    if (titleSimilarity < 0.75) errors.push("Course title similarity below 75%");
    if (codeSimilarity < 0.8) errors.push("Course code similarity below 60%");
  }

  // ---- Year Check ----
  // Extract starting year from metadata.year (e.g., "2023-24" → "2023")
const metaYearStart = metadata.year?.split('-')[0]?.trim();
const ocrYear = ocrData.year?.trim();

// Check if starting year matches OCR year
const yearValidation = (metaYearStart === ocrYear) ? 1 : 0;
if (!yearValidation) errors.push("Year does not match");

  // ---- Exam Logic vs Term ----
  const term = ocrData.term?.toLowerCase().replace(/\s/g, '');
  const examType = metadata.examType?.toLowerCase().replace(/\s/g, '');
  const maxMarks = parseInt(metadata.maxMarks);
  const maxTime = metadata.maxTime?.toLowerCase().trim();

  let examValidation = 1;

  if (
    maxTime === '2 hrs' ||
    maxMarks === 40 ||
    ['t-3', 'term-3', 'end term'].includes(examType)
  ) {
    if (!['t-3', 'term-3'].includes(term)) {
      errors.push("Expected Term 3, but term mismatch based on exam type or marks/time.");
      examValidation = 0;
    }
  }

  if (
    maxMarks === 30 ||
    ['t-2', 'term-2', 'mid term'].includes(examType)
  ) {
    if (!['t-2', 'term-2'].includes(term)) {
      errors.push("Expected Term 2, but term mismatch based on exam type or marks.");
      examValidation = 0;
    }
  }

  if (
    ['t-1', 'term-1'].includes(examType)
  ) {
    if (!['t-1', 'term-1'].includes(term)) {
      errors.push("Expected Term 1, but term mismatch based on exam type.");
      examValidation = 0;
    }
  }

  const isValid = (courseDetailValidation && yearValidation && examValidation) === 1;

  return {
    isValid,
    courseDetailValidation,
    yearValidation,
    examValidation,
    errors,
  };
}


module.exports = {
  convertPdfToImages,
  extractTextFromImages,
  extractMetadata,
  validateMetadataWithOCR
};
