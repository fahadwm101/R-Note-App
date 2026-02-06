export default async function handler(request, response) {
  // إعدادات السماح للموقع
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (request.method === 'OPTIONS') return response.status(200).end();

  // جلب المفتاح
  const apiKey = process.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    return response.status(500).json({ error: 'API Key is missing on server' });
  }

  try {
    const { prompt } = request.body;
    
    // استخدام رابط جوجل المباشر (REST API)
    // هذا الرابط يعمل دائماً ولا يحتاج تحديث مكتبات
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;

    const googleResponse = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }]
      })
    });

    const data = await googleResponse.json();

    // إذا جوجل رفض الطلب، نرسل السبب الحقيقي للطالب
    if (!googleResponse.ok) {
      console.error("Google API Error:", data);
      return response.status(500).json({ error: data.error?.message || 'Unknown Google Error' });
    }

    // استخراج النص من رد جوجل المعقد
    const text = data.candidates[0].content.parts[0].text;

    return response.status(200).json({ text });

  } catch (error) {
    console.error("Server Crash:", error);
    return response.status(500).json({ error: error.message });
  }
}
