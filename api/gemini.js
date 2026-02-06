import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(request, response) {
  // إعدادات السماح (CORS) عشان موقعك يقدر يكلم السيرفر
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // إذا كان مجرد فحص اتصال، رد بـ OK
  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  // نجيب المفتاح من خزنة Vercel الآمنة
  const apiKey = process.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    return response.status(500).json({ error: 'API Key is missing on server' });
  }

  try {
    const { prompt } = request.body;
    
    const genAI = new GoogleGenerativeAI(apiKey);
    // نستخدم الموديل السريع
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent(prompt);
    const apiResponse = await result.response;
    const text = apiResponse.text();

    return response.status(200).json({ text });
  } catch (error) {
    console.error("Server Error:", error);
    return response.status(500).json({ error: error.message });
  }
}
