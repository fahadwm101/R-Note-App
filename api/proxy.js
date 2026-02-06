import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(request, response) {
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (request.method === 'OPTIONS') return response.status(200).end();

  const apiKey = process.env.VITE_GEMINI_API_KEY;
  if (!apiKey) return response.status(500).json({ error: 'API Key missing' });

  try {
    const { prompt } = request.body;
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // استخدمنا الموديل القديم لأنه يشتغل بالعراق عبر السيرفر الأمريكي بدون مشاكل
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const result = await model.generateContent(prompt);
    const apiResponse = await result.response;
    const text = apiResponse.text();

    return response.status(200).json({ text });
  } catch (error) {
    return response.status(500).json({ error: error.message });
  }
}
