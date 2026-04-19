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

module.exports = { extractTextFromImage };
