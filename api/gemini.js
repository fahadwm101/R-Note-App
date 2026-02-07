// هذا الكود لا يحتاج أي مكتبات خارجية
export default async function handler(request, response) {
  // 1. إعدادات السماح (CORS)
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (request.method === 'OPTIONS') return response.status(200).end();

  try {
    // 2. التحقق من المفتاح
    const apiKey = process.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      return response.status(500).json({ error: 'المفتاح غير موجود في إعدادات Vercel' });
    }

    const { prompt } = request.body;

    // 3. الاتصال المباشر بجوجل (بدون مكتبة)
    // نستخدم gemini-1.5-flash لأنه الأحدث والأسرع
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const googleResponse = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }]
      })
    });

    const data = await googleResponse.json();

    // 4. معالجة الأخطاء القادمة من جوجل
    if (!googleResponse.ok) {
      console.error("Google Error:", data);
      return response.status(500).json({ 
        error: data.error?.message || 'رفض جوجل الطلب لسبب غير معروف' 
      });
    }

    // 5. استخراج النص وإرساله
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      return response.status(500).json({ error: 'جوجل أرسل رداً فارغاً' });
    }

    return response.status(200).json({ text });

  } catch (error) {
    console.error("Server Crash:", error);
    return response.status(500).json({ error: error.message });
  }
}
