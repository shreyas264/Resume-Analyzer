const { GoogleGenerativeAI } = require('@google/generative-ai');

const promptTemplate = `
You are a resume analysis assistant. Given the candidate resume text below,
produce a concise JSON object with the following keys:
- skills: array of notable technical or domain skills (max 10 items)
- summary: 2-3 sentence professional summary 
- suggested_roles: array with 1-2 ideal job titles

IMPORTANT: Return ONLY valid JSON without any markdown formatting, code blocks, or additional text.
The response must start with { and end with }.

Resume:
<<<RESUME_TEXT>>>
`;

function buildPrompt(resumeText) {
  if (!resumeText || typeof resumeText !== 'string') {
    throw new Error('Resume text must be a non-empty string');
  }
  return promptTemplate.replace('<<<RESUME_TEXT>>>', resumeText.trim());
}

function extractJSON(text) {
  if (!text || typeof text !== 'string') {
    return null;
  }

  // Remove markdown code blocks if present
  let cleaned = text.trim();
  
  // Remove ```json or ``` markers
  cleaned = cleaned.replace(/^```json\s*/i, '');
  cleaned = cleaned.replace(/^```\s*/i, '');
  cleaned = cleaned.replace(/\s*```$/i, '');
  
  // Try to find JSON object in the text
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    cleaned = jsonMatch[0];
  }

  return cleaned.trim();
}

async function analyzeResume(resumeText, apiKey) {
  if (!apiKey) {
    throw new Error('Gemini API key is not configured');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  const prompt = buildPrompt(resumeText);

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Extract and clean JSON from response
    const jsonText = extractJSON(responseText);
    
    if (!jsonText) {
      console.error('Gemini response:', responseText);
      throw new Error('No valid JSON found in Gemini response');
    }

    try {
      return JSON.parse(jsonText);
    } catch (parseError) {
      console.error('Failed to parse JSON:', jsonText);
      console.error('Parse error:', parseError.message);
      throw new Error(`Failed to parse Gemini response as JSON: ${parseError.message}`);
    }
  } catch (error) {
    if (error.message.includes('Failed to parse')) {
      throw error;
    }
    console.error('Gemini API error:', error);
    throw new Error(`Gemini API error: ${error.message}`);
  }
}

module.exports = { analyzeResume };

