const { callDeepSeek } = require('../services/aiService');

// DeepSeek client is used via callDeepSeek helper

/**
 * Shared retry wrapper for vision tasks
 */
async function callVisionWithRetry(parts) {
  let attempts = 0;
  const maxAttempts = 3;
  const delay = (ms) => new Promise(res => setTimeout(res, ms));

  while (attempts < maxAttempts) {
    try {
      const result = await model.generateContent(parts);
      const response = await result.response;
      return response.text();
    } catch (err) {
      attempts++;
      if ((err.message?.includes('429') || err.message?.includes('Quota')) && attempts < maxAttempts) {
        const waitTime = attempts * 10000;
        console.warn(`Vision API Rate Limit hit. Retrying in ${waitTime/1000}s...`);
        await delay(waitTime);
        continue;
      }
      throw err;
    }
  }
}

/**
 * visionService.js
 * Uses DeepSeek Vision models (via NVIDIA API) to extract structured data from images of printed or handwritten schemes.
 */
async function extractTextFromImage(imageBuffer, mimeType = 'image/jpeg') {
  const prompt = `Perform high-fidelity OCR on this image of a Ghanaian Basic School Scheme of Work (SOW). 
Extract as much text as possible, maintaining the logical structure (Strands, Sub-strands, Indicators, Weeks).
If the text is handwritten, do your best to transcribe it accurately.
Output ONLY the raw text found in the document.`;

  const parts = [{ inlineData: { data: imageBuffer.toString('base64'), mimeType } }, { text: prompt }];
  return await callVisionWithRetry(parts);
}

/**
 * Extracts structured timetable data (Day, Subject, Periods) from an image or document.
 */
async function parseTimetable(imageBuffer, mimeType = 'image/jpeg') {
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

  const parts = [{ inlineData: { data: imageBuffer.toString('base64'), mimeType } }, { text: prompt }];

  try {
    let text = await callVisionWithRetry(parts);
    
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
