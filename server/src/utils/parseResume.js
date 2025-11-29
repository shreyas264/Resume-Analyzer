const fs = require('fs').promises;
const path = require('path');
const pdfParse = require('pdf-parse');

// Ensure uploads directory exists
const UPLOADS_DIR = path.join(__dirname, '../../uploads');
async function ensureUploadsDir() {
  try {
    await fs.access(UPLOADS_DIR);
  } catch {
    await fs.mkdir(UPLOADS_DIR, { recursive: true });
  }
}

async function saveTextToFile(text, originalFilename) {
  await ensureUploadsDir();
  
  // Generate a unique filename
  const timestamp = Date.now();
  const baseName = originalFilename 
    ? path.parse(originalFilename).name 
    : 'resume';
  const textFileName = `${baseName}_${timestamp}.txt`;
  const filePath = path.join(UPLOADS_DIR, textFileName);
  
  // Save text to file
  await fs.writeFile(filePath, text, 'utf8');
  
  return { filePath, fileName: textFileName };
}

async function extractTextFromFile(file, saveToFile = true) {
  if (!file) {
    throw new Error('No file provided');
  }

  const isPdf = file.mimetype === 'application/pdf';
  let extractedText;

  if (isPdf) {
    // Extract text from PDF using pdf-parse function-based API
    try {
      // Ensure we have a proper Buffer
      if (!file.buffer) {
        throw new Error('No buffer data in uploaded file');
      }
      
      // pdf-parse v1.x accepts Buffer directly
      const buffer = Buffer.isBuffer(file.buffer) 
        ? file.buffer 
        : Buffer.from(file.buffer);
      
      // Use the simple function-based API
      const pdfData = await pdfParse(buffer);
      extractedText = pdfData.text;
    } catch (error) {
      console.error('PDF parsing error:', error.message);
      throw new Error(`Failed to parse PDF: ${error.message}`);
    }
    
    // Save PDF text to a .txt file
    if (saveToFile && extractedText) {
      const { filePath, fileName } = await saveTextToFile(extractedText, file.originalname);
      console.log(`PDF text saved to: ${filePath}`);
      return { text: extractedText, textFilePath: filePath, textFileName: fileName };
    }
    
    return { text: extractedText };
  } else {
    // For text files, read the content
    extractedText = file.buffer.toString('utf8');
    
    // Optionally save text file (if it's already a text file, we might not need to save again)
    if (saveToFile && extractedText) {
      const { filePath, fileName } = await saveTextToFile(extractedText, file.originalname);
      console.log(`Text file saved to: ${filePath}`);
      return { text: extractedText, textFilePath: filePath, textFileName: fileName };
    }
    
    return { text: extractedText };
  }
}

module.exports = { extractTextFromFile, saveTextToFile };

