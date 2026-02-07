// نستخدم الصيغة الكلاسيكية (CommonJS) لمنع تحطم السيرفر
module.exports = async (request, response) => {
  // إعدادات السماح
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (request.method === 'OPTIONS') return response.status(200).end();

  try {
    const apiKey = process.env.VITE_GEMINI_API_KEY;
    // نتأكد أن المفتاح موجود
    if (!apiKey) throw new Error('API Key is missing in Vercel Settings');

    const { prompt } = request.body;
    
    // رابط gemini-pro المباشر
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;

    const googleResponse = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });

    const data = await googleResponse.json();

    if (!googleResponse.ok) {
      throw new Error(data.error?.message || 'Google API Error');
    }

    return response.status(200).json({ text: data.candidates[0].content.parts[0].text });

  } catch (error) {
    console.error("Server Error:", error);
    // نرجع رسالة الخطأ كنص json عشان نشوفها بالمتصفح
    return response.status(500).json({ error: error.message });
  }
};
