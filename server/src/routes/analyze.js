const express = require('express');
const multer = require('multer');
const Resume = require('../models/Resume');
const { extractTextFromFile } = require('../utils/parseResume');
const { analyzeResume } = require('../services/geminiClient');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });
const router = express.Router();

router.post('/analyze', upload.single('resume'), async (req, res) => {
  try {
    const { text, name, email } = req.body;
    const file = req.file;

    if (!text && !file) {
      return res.status(400).json({ error: 'Provide either resume text or upload a file.' });
    }

    let resumeText = text;
    let textFileInfo = null;

    if (!resumeText && file) {
      // extract text from file and save it as a .txt file
      const extractionResult = await extractTextFromFile(file, true);
      
      // handle both old format (string) and new format (object with text property)
      if (typeof extractionResult === 'string') {
        resumeText = extractionResult;
      } else if (extractionResult && extractionResult.text) {
        resumeText = extractionResult.text;
        textFileInfo = {
          filePath: extractionResult.textFilePath,
          fileName: extractionResult.textFileName
        };
      } else {
        resumeText = extractionResult;
      }
    }

    // ensure resumeText is a string
    if (resumeText && typeof resumeText !== 'string') {
      resumeText = String(resumeText);
    }

    if (!resumeText || typeof resumeText !== 'string' || !resumeText.trim()) {
      return res.status(400).json({ error: 'Unable to extract text from resume.' });
    }

    const aiSummary = await analyzeResume(resumeText, process.env.GEMINI_API_KEY);

    const resumeDoc = await Resume.create({
      name,
      email,
      resumeText,
      aiSummary: { ...aiSummary, raw: aiSummary },
      sourceFilename: file?.originalname,
      textFilePath: textFileInfo?.filePath,
      textFileName: textFileInfo?.fileName,
    });

    return res.json({ 
      result: aiSummary, 
      recordId: resumeDoc._id,
      textFile: textFileInfo ? {
        fileName: textFileInfo.fileName,
        message: 'Text file saved successfully'
      } : null
    });
  } catch (error) {
    console.error('Analyze error', error);
    return res.status(500).json({ error: error.message || 'Failed to analyze resume' });
  }
});

module.exports = router;

