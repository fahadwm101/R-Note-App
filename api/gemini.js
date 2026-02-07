export default async function handler(request, response) {
  // إعدادات CORS
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (request.method === 'OPTIONS') return response.status(200).end();

  try {
    const apiKey = process.env.VITE_GEMINI_API_KEY;
    if (!apiKey) return response.status(500).json({ error: 'المفتاح مفقود' });

    const { messages, currentData } = request.body;

    // تعليمات النظام الصارمة
    const systemPrompt = `
      أنت المساعد الذكي لتطبيق R.NOTE.
      لديك صلاحية كاملة لإدارة بيانات الطالب.
      
      البيانات الحالية:
      ${JSON.stringify(currentData)}

      يجب أن يكون ردك بصيغة JSON فقط وحصراً (بدون markdown)، بهذا الشكل:
      {
        "reply": "نص الرد باللهجة العراقية",
        "action": {
          "type": "NONE" | "ADD_TASK" | "DELETE_TASK" | "ADD_NOTE" | "DELETE_NOTE" | "ADD_ASSIGNMENT" | "DELETE_ASSIGNMENT",
          "payload": { ...تفاصيل العنصر... }
        }
      }
    `;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const googleResponse = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          { role: "user", parts: [{ text: systemPrompt }] },
          ...messages
        ],
        generationConfig: { response_mime_type: "application/json" }
      })
    });

    const data = await googleResponse.json();

    if (!googleResponse.ok) {
        console.error("Google API Error:", data);
        throw new Error(data.error?.message || 'خطأ من جوجل');
    }

    // تنظيف الرد من أي شوائب (مثل علامات ```json)
    let textResponse = data.candidates[0].content.parts[0].text;
    textResponse = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();

    return response.status(200).json(JSON.parse(textResponse));

  } catch (error) {
    console.error("Server Error:", error);
    return response.status(500).json({ error: error.message });
  }
}
