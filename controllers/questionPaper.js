const express = require("express");
const { google } = require("googleapis");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const QuestionPaper = require("../models/questionPaper");
const Subject = require("../models/subject");
const serviceAccount = {
  type: "service_account",
  project_id: process.env.PROJECT_ID,
  private_key_id: process.env.PRIVATE_KEY_ID,
  private_key: process.env.PRIVATE_KEY.replace(/\\n/g, '\n'),  // Replace literal \n with actual newlines
  client_email: process.env.CLIENT_EMAIL,
  client_id: process.env.CLIENT_ID,
  auth_uri: process.env.AUTH_URI,
  token_uri: process.env.TOKEN_URI,
  auth_provider_x509_cert_url: process.env.AUTH_PROVIDER_CERT_URL,
  client_x509_cert_url: process.env.CLIENT_CERT_URL,
};

const auth = new google.auth.GoogleAuth({ 
  //keyFile:  path.join(__dirname, '../jprep2025.json'), // Path to your service account key
  credentials: serviceAccount,
  scopes: ["https://www.googleapis.com/auth/drive"],
});
const drive = google.drive({ version: "v3", auth });

//testing starts -----

async function checkFolder(folderId) {
  const authClient = await auth.getClient();
  const drive = google.drive({ version: "v3", auth: authClient });

  const res = await drive.files.list({
    q: `'${folderId}' in parents and trashed = false`,
    fields: "files(id, name)",
  });

  console.log("folder response : ", res.data);

  console.log("Files found in folder:", res.data.files);
}

checkFolder("1-oyGcR9cg3-F2_uE7ymRBNg-GKhZnGN0");


//testing ends---


const uploadDir = path.join(__dirname, "../uploads");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["application/pdf", "application/msword", "image/jpeg", "image/jpg"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only PDF, DOC, JPEG, and JPG files are allowed."), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 3 * 1024 * 1024 },
});

const deleteLocalFile = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.unlink(filePath, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
};


const folderId = "1-oyGcR9cg3-F2_uE7ymRBNg-GKhZnGN0";
const domain = "mail.jiit.ac.in";

// Create question paper

// const createQuestionPaper = [
// upload.single("file"),
// async (req, res) => {
//   if (!req.file) return res.status(400).json({ message: "No file found!" });

//   const filePath = path.join(__dirname, "../uploads", req.file.filename);

//   try {
//     const { name, term, year, contributor, score, code } = req.body;
//     if (!name || !term || !year || !contributor || !score || !code) {
//       await deleteLocalFile(filePath);
//       return res.status(400).json({ message: "Missing required fields!" });
//     }

//     // Find the subject
//     const subject = await Subject.findOne({ name: name, code: code });
//     if (!subject) {
//       await deleteLocalFile(filePath);
//       return res.status(404).json({ message: "Subject not found!" });
//     }


//     console.log("file: ", req.file)
//     const fileMetadata = {
//           name: req.file.filename,
//           parents: [folderId], // Upload to this folder
//         };
    
//         const media = {
//           mimeType: req.file.mimetype,
//           body: fs.createReadStream(req.file.path),
//         };
    
//         // Upload the file to Google Drive
//         const file = await drive.files.create({
//           resource: fileMetadata,
//           media: media,
//           fields: "id, name, parents",
//         });
    
//         // Set file permissions to public
//         await drive.permissions.create({
//           fileId: file.data.id,
//           requestBody: {
//             role: "reader",
//             type: "domain",
//             domain: "mail.jiit.ac.in",
//           },
//         });

//         await deleteLocalFile(filePath);

//     const questionPaper = new QuestionPaper({
//       name,
//       term,
//       year,
//       code,
//       contributor,
//       score,
//       fileId: file.data.id,
//       fileName: file.data.name,
//       viewLink: `https://drive.google.com/file/d/${file.data.id}/view`,
//       downloadLink: `https://drive.google.com/uc?id=${file.data.id}&export=download`,
//     });

//     await questionPaper.save();

//     // Add question paper to subject
//     subject.questionMaterial.push(questionPaper._id);
//     await subject.save();

//     res.status(201).json({
//       message: "Question paper uploaded and saved to database!",
//       questionPaper,
//     });
//   } catch (error) {
//     console.error("Error uploading file:", error.message);
//     await deleteLocalFile(filePath);
//     res.status(500).json({ message: "Failed to upload question paper", error: error.message });
//   }
// },
// ];






// test function start ---------------------------------


// const Tesseract = require("tesseract.js");
// const Poppler = require("pdf-poppler");

// const convertPdfToImages = async (pdfPath) => {
//   const outputDir = path.dirname(pdfPath);
//   const options = {
//     format: "jpeg",
//     out_dir: outputDir,
//     out_prefix: path.basename(pdfPath, path.extname(pdfPath)),
//     page: null, // All pages
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


// Helper to extract text
const extractTextFromFile = async (filePath, mimeType) => {
  if (mimeType === "application/pdf") {
    const buffer = fs.readFileSync(filePath);
    const data = await pdfParse(buffer);
    //console.log("data: " , data);
    return data.text;
  }

  // Use Tesseract for images
  const { data: { text } } = await Tesseract.recognize(filePath, "eng");

  console.log("after teseract processing: " , {text});
  return text;
};

const { convertPdfToImages, extractTextFromImages, extractMetadata, validateMetadataWithOCR } = require("../utils/ocrUtils");


const createQuestionPaper = [
  
  upload.single("file"),
  async (req, res) => {
    if (!req.file) return res.status(400).json({ message: "No file found!" });

    const filePath = path.join(__dirname, "../uploads", req.file.filename);
    
    let extractedInfo = {};

    try {
      const { name, term, year, contributor, code } = req.body;
      //console.log("received in req body: ", req.body);
      if (!name || !term || !year || !contributor || !code) {
        await deleteLocalFile(filePath);
        return res.status(400).json({ message: "Missing required fields!" });
      }


      
      // Perform OCR
      

      if (req.file.mimetype === "application/pdf") {
        const images = await convertPdfToImages(filePath);
        const { text, metadata, confidenceScore } = await extractTextFromImages(images);
      
        extractedInfo = {
          text,
          metadata,
          confidenceScore,
        };
      
        // Clean up image files after OCR
        for (const imgPath of images) {
          fs.unlinkSync(imgPath);
        }
      } else if (req.file.mimetype.startsWith("image/")) {
        const { data } = await Tesseract.recognize(filePath, "eng");
      
        // For single image, extract metadata and confidence
        const metadata = extractMetadata(data.text); // you’ll need to import extractMetadata
        const confidenceScore = data.confidence || 0;
      
        extractedInfo = {
          text: data.text,
          metadata,
          confidenceScore,
        };
      }

      const score = extractedInfo.confidenceScore;
      const metadata = extractedInfo.metadata;
      const extractedText = extractedInfo.text;
      const confidenceScore = extractedInfo.confidenceScore
// console.log("extracted text: ", extractedText);
// console.log("metaData : " , metadata);
// console.log("confidenceScore: ", confidenceScore);

// OCR Validation: Check if text includes name and code

      const ocrData = {name: name, term: term, year: year, code: code };

      console.log("validating ocrddata: ", ocrData, " with meta Data", metadata); 

      const validationResult = validateMetadataWithOCR(metadata, ocrData);

      

// if (!extractedText.includes(name) || !extractedText.includes(code)) {
//   await deleteLocalFile(filePath);
//   return res.status(400).json(
//                         { extractedInfo, 
//                           message: "OCR failed to validate subject name or code in the file." 
//                         });
// }

// Now proceed to find the subject
const subject = await Subject.findOne({ name: name, code: code });
if (!subject) {
  await deleteLocalFile(filePath);
  return res.status(404).json(
                        {extractedInfo,  
                          validationResult,
                          message: "Subject not found!" });
}

if(!validationResult.isValid){
  await deleteLocalFile(filePath);
  return res.status(400).json(
                        { extractedInfo, 
                          validationResult,
                          message: "OCR failed to validate subject name or code in the file." 
                        });
}


      // Step 4: Upload to Google Drive
      const fileMetadata = {
        name: req.file.filename,
        parents: [folderId],
      };

      const media = {
        mimeType: req.file.mimetype,
        body: fs.createReadStream(req.file.path),
      };
      

      const file = await drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: "id, name, parents",
        supportsAllDrives: true,
      });

      console.log("after the file creation");

      await drive.permissions.create({
        fileId: file.data.id,
        requestBody: {
          role: "reader",
          type: "domain",
          domain: domain,
        },
        supportsAllDrives: true, 
      });

      await deleteLocalFile(filePath); // Clean up local file

      // Save to DB
      const questionPaper = new QuestionPaper({
        name,
        term,
        year,
        code,
        contributor,
        score,
        fileId: file.data.id,
        fileName: file.data.name,
        viewLink: `https://drive.google.com/file/d/${file.data.id}/view`,
        downloadLink: `https://drive.google.com/uc?id=${file.data.id}&export=download`,
      });

      await questionPaper.save();

      subject.questionMaterial.push(questionPaper._id);
      await subject.save();

      res.status(201).json({
        message: "Question paper uploaded and saved to database!",
        questionPaper,
        extractedInfo, 
        validationResult,
      });
    } catch (error) {
      console.error("Error:", error);
      await deleteLocalFile(filePath);
      res.status(500).json({ message: "Failed to upload question paper", error: error.message, extractedInfo});
    }
  },
];


// test funciton ends--------------------------------------

// Delete question paper
const deleteQuestionPaper = async (req, res) => {
  try {
    const { id } = req.params;
    const questionPaper = await QuestionPaper.findById(id);
    if (!questionPaper) return res.status(404).json({ message: "Question paper not found" });

    const fileId = questionPaper.fileId;
    await drive.files.delete({fileId});
    await QuestionPaper.findByIdAndDelete(id);
    await Subject.updateOne({ questionMaterial: id }, { $pull: { questionMaterial: id } });

    res.status(200).json({ message: "Question paper deleted successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete question paper", error: error.message });
  }
};

module.exports = {
  createQuestionPaper,
  deleteQuestionPaper,
};
