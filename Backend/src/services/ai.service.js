const { GoogleGenAI } = require("@google/genai");
const { z } = require("zod");
const puppeteer = require("puppeteer");

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY,
});

const MODEL_NAME = "gemini-3.6-flash";

const interviewReportSchema = z.object({
  title: z.string(),

  matchScore: z.number().min(0).max(100),

  technicalQuestions: z.array(
    z.object({
      question: z.string(),
      intention: z.string(),
      answer: z.string(),
    })
  ),

  behavioralQuestions: z.array(
    z.object({
      question: z.string(),
      intention: z.string(),
      answer: z.string(),
    })
  ),

  skillGaps: z.array(
    z.object({
      skill: z.string(),
      severity: z.enum(["low", "medium", "high"]),
    })
  ),

  preparationPlan: z.array(
    z.object({
      day: z.number(),
      focus: z.string(),
      tasks: z.array(z.string()),
    })
  ),
});

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function generateWithRetry(callback, retries = 3) {
  let lastError;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`AI request attempt ${attempt}/${retries}`);

      return await callback();
    } catch (error) {
      lastError = error;

      console.error(
        `AI attempt ${attempt} failed:`,
        error.message
      );

      if (error.status !== 503 || attempt === retries) {
        throw error;
      }

      const delay = attempt * 3000;

      console.log(
        `Waiting ${delay / 1000} seconds before retry...`
      );

      await sleep(delay);
    }
  }

  throw lastError;
}

function cleanJsonString(value) {
  if (typeof value !== "string") {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function normalizeAiResponse(data) {
  return {
    ...data,

    technicalQuestions: Array.isArray(data.technicalQuestions)
      ? data.technicalQuestions.map(cleanJsonString)
      : [],

    behavioralQuestions: Array.isArray(data.behavioralQuestions)
      ? data.behavioralQuestions.map(cleanJsonString)
      : [],

    skillGaps: Array.isArray(data.skillGaps)
      ? data.skillGaps.map(cleanJsonString)
      : [],

    preparationPlan: Array.isArray(data.preparationPlan)
      ? data.preparationPlan.map(cleanJsonString)
      : [],
  };
}

async function generateInterviewReport({
  resume,
  selfDescription,
  jobDescription,
}) {
  try {
    console.log("Calling Gemini AI...");

    const prompt = `
You are an expert technical interviewer and career coach.

Generate an interview preparation report.

Return valid JSON only.

Use exactly this structure:

{
  "title": "string",
  "matchScore": 85,

  "technicalQuestions": [
    {
      "question": "string",
      "intention": "string",
      "answer": "string"
    }
  ],

  "behavioralQuestions": [
    {
      "question": "string",
      "intention": "string",
      "answer": "string"
    }
  ],

  "skillGaps": [
    {
      "skill": "string",
      "severity": "low"
    }
  ],

  "preparationPlan": [
    {
      "day": 1,
      "focus": "string",
      "tasks": ["string"]
    }
  ]
}

Requirements:

- Generate exactly 5 technical questions.
- Generate exactly 4 behavioral questions.
- Generate 3 to 5 skill gaps.
- Generate a 5-day preparation plan.
- matchScore must be between 0 and 100.
- severity must only be low, medium, or high.
- Do not invent fake experience.
- Base everything on the candidate information and job description.

Candidate Resume:
${resume}

Candidate Self Description:
${selfDescription}

Target Job Description:
${jobDescription}

Return ONLY valid JSON.
`;

    const response = await generateWithRetry(() =>
      ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      })
    );

    if (!response.text) {
      throw new Error("AI did not return a response");
    }

    const parsedData = JSON.parse(response.text);

    const normalizedData =
      normalizeAiResponse(parsedData);

    const validation =
      interviewReportSchema.safeParse(normalizedData);

    if (!validation.success) {
      console.dir(validation.error.format(), {
        depth: null,
      });

      throw new Error(
        "AI generated invalid report structure"
      );
    }

    console.log("AI REPORT VALIDATION SUCCESSFUL");

    return validation.data;
  } catch (error) {
    console.error(
      "Error generating interview report:",
      error.message
    );

    throw error;
  }
}

async function generatePdfFromHtml(htmlContent) {
  let browser;

  try {
    browser = await puppeteer.launch({
      headless: true,
    });

    const page = await browser.newPage();

    await page.setContent(htmlContent, {
      waitUntil: "networkidle0",
    });

    return await page.pdf({
      format: "A4",
      printBackground: true,

      margin: {
        top: "20mm",
        bottom: "20mm",
        left: "15mm",
        right: "15mm",
      },
    });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

async function generateResumePdf({
  resume,
  selfDescription,
  jobDescription,
}) {
  try {
    const prompt = `the response should be a JSON object with a single field "html" which contains the HTML content of the resume which can be converted to PDF using any library like puppeteer.
        The resume should be tailored for the given job description and should highlight the candidate's strengths and relevant experience. The HTML content should be well-formatted and structured, making it easy to read and visually appealing.
        The content of resume should be not sound like it's generated by AI and should be as close as possible to a real human-written resume.
        you can highlight the content using some colors or different font styles but the overall design should be simple and professional.
        The content should be ATS friendly, i.e. it should be easily parsable by ATS systems without losing important information.
        The resume should not be so lengthy, it should ideally be 1-2 pages long when converted to PDF. Focus on quality rather than quantity and make sure to include all the relevant information that can increase the candidate's chances of getting an interview call for the given job description.

{
  "html": "<html>...</html>"
}

Candidate Resume:
${resume}

Self Description:
${selfDescription}

Job Description:
${jobDescription}
`;

    const response = await generateWithRetry(() =>
      ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      })
    );

    if (!response.text) {
      throw new Error(
        "AI did not generate resume content"
      );
    }

    const result = JSON.parse(response.text);

    if (!result.html) {
      throw new Error(
        "AI did not return resume HTML"
      );
    }

    return await generatePdfFromHtml(result.html);
  } catch (error) {
    console.error(
      "Error generating resume PDF:",
      error.message
    );

    throw error;
  }
}

module.exports = {
  generateInterviewReport,
  generateResumePdf,
};