const { GoogleGenAI } = require('@google/genai');

const fallback = {
  summary: 'Your notes are ready to review. Add a Gemini API key and a connected database to generate a personalized summary from this document.',
  quiz: Array.from({ length: 5 }, (_, i) => ({ questionText: `Review question ${i + 1}: what is the main idea in this section?`, options: ['The central concept', 'An unrelated detail', 'A formatting rule', 'None of these'], correctOptionIndex: 0, explanation: 'Use the document text to explain why the central concept is the best answer.' })),
  flashcards: Array.from({ length: 8 }, (_, i) => ({ frontQuestion: `Key term ${i + 1}`, backAnswer: 'Review the extracted document text for its definition and an example.' })),
  viva: Array.from({ length: 5 }, (_, i) => `Explain the significance of concept ${i + 1} from this document.`)
};

function cleanJson(text) {
  const match = String(text).match(/```(?:json)?\s*([\s\S]*?)\s*```/) || [null, text];
  return JSON.parse(match[1].trim());
}

async function generate(type, text) {
  if (!process.env.GEMINI_API_KEY) return fallback[type];
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const prompts = {
      summary: 'Create concise, well-structured smart study notes with headings, bullets, key terms, and a short takeaway. Return plain text.',
      quiz: 'Create exactly 5 multiple-choice questions. Return JSON array only: [{questionText,options:[4 strings],correctOptionIndex,explanation}].',
      flashcards: 'Create exactly 8 terminology flashcards. Return JSON array only: [{frontQuestion,backAnswer}].',
      viva: 'Create exactly 5 oral exam questions. Return JSON array of strings only.'
    };
    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: `${prompts[type]}\n\nDocument:\n${text.slice(0, 50000)}`, config: { responseMimeType: type === 'summary' ? 'text/plain' : 'application/json' } });
    return type === 'summary' ? response.text : cleanJson(response.text);
  } catch (error) {
    console.warn(`Gemini ${type} failed: ${error.message}`);
    return fallback[type];
  }
}

module.exports = { generate };
