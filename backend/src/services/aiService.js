import { GoogleGenAI, Type } from '@google/genai';

const intentSchema = {
  type: Type.OBJECT,
  properties: {
    intent: { type: Type.STRING, enum: ['CREATE_EXPENSE','CREATE_TASK','CREATE_REMINDER','LIST_TASKS','LIST_EXPENSES','GET_EXPENSE_SUMMARY','CAMPUS_INFO','UNKNOWN'] },
    parameters: {
      type: Type.OBJECT,
      properties: {
        amount: { type: Type.NUMBER }, category: { type: Type.STRING }, description: { type: Type.STRING }, date: { type: Type.STRING },
        title: { type: Type.STRING }, dueDate: { type: Type.STRING }, priority: { type: Type.STRING, enum: ['low','medium','high'] },
        status: { type: Type.STRING, enum: ['pending','completed'] }, topic: { type: Type.STRING }
      }
    },
    response: { type: Type.STRING }
  }, required: ['intent','parameters','response']
};

export async function understandCommand(transcript) {
  if (!process.env.GEMINI_API_KEY) {
    const error = new Error('Gemini is not configured. Add GEMINI_API_KEY to backend/.env and restart the server.');
    error.status = 503; throw error;
  }
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const today = new Date().toISOString().slice(0, 10);
  const result = await ai.models.generateContent({
    model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
    contents: `You are the intent parser for CampusVoice AI. Today is ${today}. User timezone is Asia/Kolkata. Convert the transcript into one supported intent and parameters. Never invent missing amounts or dates. Use ISO date strings (YYYY-MM-DD) for dates and ISO 8601 with timezone +05:30 for reminder date/time when a time is stated. If required information is missing, keep its field absent and ask a concise clarification in response. Expense category should be one of Food, Transport, Education, Shopping, Bills, Other. CAMPUS_INFO topic can be events, library, academic, or general. Do not execute anything. Return only schema-conforming JSON.\nTranscript: ${transcript}`,
    config: { responseMimeType: 'application/json', responseSchema: intentSchema, temperature: 0.1 }
  });
  const raw = result.text;
  if (!raw) throw Object.assign(new Error('Gemini returned an empty response. Please try again.'), { status: 502 });
  try { return JSON.parse(raw); }
  catch { throw Object.assign(new Error('Gemini returned invalid structured data. Please try rephrasing.'), { status: 502 }); }
}
