const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * visionService.js
 * Uses Gemini Vision models to extract structured data from images of printed or handwritten schemes.
 */
async function extractTextFromImage(imageBuffer, mimeType = 'image/jpeg') {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `Perform high-fidelity OCR on this image of a Ghanaian Basic School Scheme of Work (SOW). 
Extract as much text as possible, maintaining the logical structure (Strands, Sub-strands, Indicators, Weeks).
If the text is handwritten, do your best to transcribe it accurately.
Output ONLY the raw text found in the document.`;

  const imageParts = [
    {
      inlineData: {
        data: imageBuffer.toString('base64'),
        mimeType
      }
    }
  ];

  try {
    const result = await model.generateContent([prompt, ...imageParts]);
    const response = await result.response;
    return response.text();
  } catch (err) {
    console.error('Vision OCR Error:', err);
    throw new Error('Failed to process image with Vision AI: ' + err.message);
  }
}

/**
 * Extracts structured timetable data (Day, Subject, Periods) from an image or document.
 */
async function parseTimetable(imageBuffer, mimeType = 'image/jpeg') {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  // Use gemini-1.5-flash for broader document compatibility if 2.0 has issues
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `You are an expert at parsing school timetables from various formats (images, PDFs, or scans). 
Extract the weekly schedule from this document. 
Combine consecutive periods of the same subject on the same day into a single entry with 'periods' count.

Output ONLY a valid JSON object with this EXACT structure:
{
  "schedule": [
    { "day": "Monday", "subject": "Mathematics", "periods": 2, "startTime": "8:00 AM", "endTime": "9:20 AM" }
  ],
  "rawText": "full text here"
}

Rules:
1. Normalize subject names (e.g., 'Math' -> 'Mathematics').
2. Identify the day for each subject correctly.
3. If periods are indicated separately (e.g. Math, Math), count them as 2 periods.
4. If it's a multi-class timetable, ONLY extract the schedule relevant to the primary class shown.
5. Do NOT include markdown formatting or backticks in your response. Output raw JSON only.`;

  const parts = [
    {
      inlineData: {
        data: imageBuffer.toString('base64'),
        mimeType
      }
    },
    { text: prompt }
  ];

  try {
    const result = await model.generateContent(parts);
    const response = await result.response;
    let text = response.text();
    
    // Clean potential markdown backticks
    text = text.replace(/```json|```/g, '').trim();
    
    try {
      return JSON.parse(text);
    } catch (parseErr) {
      console.error('JSON Parse Error. Raw text:', text);
      throw new Error('AI returned invalid data format. Please try a clearer image.');
    }
  } catch (err) {
    console.error('Timetable Parsing Error:', err);
    throw new Error('Failed to parse timetable: ' + (err.message || 'Unknown AI error'));
  }
}

module.exports = { extractTextFromImage, parseTimetable };
