const pdfParse = require('pdf-parse');
const client = require('../config/gemini');

exports.scanResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Please upload a PDF." });
    }

    const parseFunction = typeof pdfParse === 'function' ? pdfParse : pdfParse.default;

    const pdfData = await parseFunction(req.file.buffer);
    const resumeText = pdfData.text;
    
    const targetRole = req.body.targetRole || 'Not specified';

    const prompt = `You are an expert ATS System. Analyze the following resume text.
    1. Extract core technical skills as a comma-separated list.
    2. Provide a short 2-line professional summary.
    3. Crucially, based on the skills and experience, suggest the top 2 or 3 matching JOB ROLES or FIELDS (e.g. "Frontend Developer", "DevOps Engineer", "Data Analyst", "MERN Stack Developer"). These will be used to search for jobs.
    4. If a target role (${targetRole}) is given, calculate a match percentage (0-100) and give 1 strength and 1 missing keyword.
    
    RESPOND STRICTLY IN VALID JSON FORMAT:
    {
      "skills": "Skill1, Skill2, Skill3",
      "summary": "Short summary...",
      "suggestedRoles": ["Field/Role 1", "Field/Role 2"], 
      "atsScore": 85,
      "strength": "Good React experience",
      "missing": "AWS"
    }
    
    Resume Text: ${resumeText}`;

    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }]
    });

    let rawText = response.text;
    if (typeof rawText === 'function') rawText = response.text();
    rawText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();

    const aiResult = JSON.parse(rawText);

    res.status(200).json({ success: true, data: aiResult });
  } catch (error) {
    console.error("AI Scan Error:", error);
    res.status(500).json({ success: false, message: "Error scanning resume." });
  }
};