const mongoose = require('mongoose');

const ResumeSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    email: { type: String, trim: true },
    resumeText: { type: String, required: true },
    aiSummary: {
      skills: [String],
      summary: String,
      suggested_roles: [String],
      raw: mongoose.Schema.Types.Mixed,
    },
    sourceFilename: String,
    textFilePath: String,
    textFileName: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Resume', ResumeSchema);

