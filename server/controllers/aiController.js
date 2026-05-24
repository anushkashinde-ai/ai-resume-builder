import Resume from "../models/Resume.js";
import genAI from "../configs/ai.js";


// ==========================================
// Controller for Enhancing Professional Summary
// POST : /api/ai/enhance-pro-sum
// ==========================================

export const enhanceProfessionalSummary = async (req, res) => {
  console.log("Request Body:", req.body);

  try {
    const { userContent } = req.body;

    if (!userContent) {
      return res.status(400).json({
        message: "Missing required fields",
      });
    }

    // Use Gemini Model
    const modelName = process.env.GEMINI_MODEL_NAME || "gemini-1.5-flash";
    console.log(`Using AI model: ${modelName}`);

    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 500,
      },
    });

    const prompt = `
You are an expert ATS resume writer.

Enhance the following professional summary for a resume.

Requirements:
- ATS friendly
- Professional tone
- Concise and impactful
- Use strong action verbs
- Keep it within 3-5 lines

Professional Summary:
${userContent}

Return only the enhanced summary text.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const enhancedContent = response.text();

    return res.status(200).json({
      enhancedContent,
    });

  } catch (error) {
    console.error("AI ENHANCEMENT FAILED:", error);
    // Fallback: Return a simple enhanced version if AI is unavailable
    const { userContent } = req.body;
    const fallbackEnhancement = userContent 
      ? `Results-driven professional with expertise in ${userContent}. Proven track record of delivering high-quality solutions and driving success. Passionate about innovation and continuous improvement.` 
      : "Please provide a professional summary to enhance.";
    
    return res.status(200).json({
      enhancedContent: fallbackEnhancement,
      message: "AI temporarily unavailable, using fallback enhancement."
    });
  }
};



// ==========================================
// Controller for Enhancing Job Description
// POST : /api/ai/enhance-job-desc
// ==========================================

export const enhanceJobDesc = async (req, res) => {

  try {

    const { userContent } = req.body;

    if (!userContent) {
      return res.status(400).json({
        message: "Missing required fields",
      });
    }

    // Use Gemini Model
    const modelName =
      process.env.GEMINI_MODEL_NAME || "gemini-1.5-flash";

    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 500,
      },
    });

    const prompt = `
You are an expert resume writer.

Your task is to enhance the following job description.

Requirements:
- ATS friendly
- Use strong action verbs
- Highlight responsibilities and achievements
- Add measurable impact where possible
- Keep it professional
- Keep it concise (1-2 sentences)

Job Description:
${userContent}

Return only the enhanced description text.
`;

    const result = await model.generateContent(prompt);

    const response = await result.response;

    const enhancedContent = response.text();

    return res.status(200).json({
      enhancedContent,
    });

  } catch (error) {

    console.error("JOB DESCRIPTION ENHANCEMENT FAILED:", error);

    return res.status(500).json({
      message: error.message || "AI enhancement failed",
    });

  }
};



// ==========================================
// Controller for Uploading Resume
// POST : /api/ai/upload-resume
// ==========================================

export const uploadResume = async (req, res) => {

  console.log("UPLOAD RESUME CALLED", {
    title: req.body.title,
    textLength: req.body.resumeText?.length,
  });

  try {

    const { resumeText, title } = req.body;

    const userId = req.userId;

    if (!resumeText) {
      return res.status(400).json({
        message: "Missing required fields",
      });
    }

    // Use Gemini Model
    const modelName =
      process.env.GEMINI_MODEL_NAME || "gemini-1.5-flash";

    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.3,
        maxOutputTokens: 2000,
      },
    });

    const prompt = `
Extract structured data from the following resume.

Resume Text:
${resumeText}

Provide data ONLY in valid JSON format.

{
  "professionalSummary": "string",
  "skills": ["string"],
  "personalInfo": {
    "fullName": "string",
    "profession": "string",
    "email": "string",
    "phone": "string",
    "location": "string",
    "linkedin": "string",
    "website": "string"
  },
  "experience": [
    {
      "company": "string",
      "position": "string",
      "startDate": "string",
      "endDate": "string",
      "description": "string",
      "isCurrent": boolean
    }
  ],
  "projects": [
    {
      "name": "string",
      "tech": "string",
      "description": "string"
    }
  ],
  "education": [
    {
      "institution": "string",
      "degree": "string",
      "field": "string",
      "graduationDate": "string",
      "gpa": "string"
    }
  ]
}

Rules:
- Return ONLY valid JSON
- No markdown
- No extra explanation
- All dates should be strings
- Boolean fields should be true/false
`;

    const result = await model.generateContent(prompt);

    const response = await result.response;

    let extractedDataText = response.text();

    console.log("AI RAW RESPONSE:", extractedDataText);

    // Clean JSON if wrapped in markdown
    extractedDataText = extractedDataText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    let parsedData;

    try {

      parsedData = JSON.parse(extractedDataText);

      console.log("AI PARSED DATA:", parsedData);

    } catch (parseError) {

      console.error(
        "JSON PARSE ERROR:",
        parseError,
        extractedDataText
      );

      return res.status(422).json({
        message:
          "The AI returned invalid JSON. Please try another resume.",
        details: parseError.message,
      });
    }

    // Save Resume in Database
    const newResume = await Resume.create({
      userId,
      title,
      ...parsedData,
    });

    return res.status(200).json({
      success: true,
      resumeId: newResume._id,
    });

  } catch (error) {

    console.error("UPLOAD RESUME ERROR:", error);

    return res.status(500).json({
      message: error.message || "Resume upload failed",
    });

  }
};