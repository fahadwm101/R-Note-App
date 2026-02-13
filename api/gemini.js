export default async function handler(request, response) {
  // 1. السماح بالوصول (CORS)
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (request.method === 'OPTIONS') return response.status(200).end();

  try {
    const apiKey = process.env.VITE_GEMINI_API_KEY;
    if (!apiKey) return response.status(500).json({ error: 'المفتاح مفقود' });

    const { messages, currentData } = request.body;

    // 2. تعليمات النظام (هنا نعطيه الشخصية والصلاحيات)
    const systemPrompt = `
      أنت المساعد الذكي لتطبيق R.NOTE.
      دورك: إدارة حياة الطالب الدراسية بالكامل.
      اللهجة: عراقية ودودة ومختصرة.
      
      البيانات الحالية للطالب هي:
      ${JSON.stringify(currentData)}

      القاعدة الذهبية:
      لا ترد بنص عادي أبداً. يجب أن يكون ردك بصيغة JSON فقط وحصراً، بهذا الشكل:
      {
        "reply": "نص الرد الذي سيقرأه الطالب",
        "action": {
          "type": "NONE" | "ADD_TASK" | "DELETE_TASK" | "ADD_NOTE" | "DELETE_NOTE" | "ADD_ASSIGNMENT" | "DELETE_ASSIGNMENT",
          "payload": { ...بيانات العنصر الجديد أو الـ id للعنصر المحذوف... }
        }
      }

      أمثلة:
      - الطالب: "ضيف مهمة كويز بايثون باجر"
        الرد: { "reply": "تمام، ضفتلك كويز بايثون لباجر.", "action": { "type": "ADD_TASK", "payload": { "title": "كويز بايثون", "date": "2024-02-10" } } }
      
      - الطالب: "امسح الملاحظة الي كتبتها عن الجافا"
        الرد: { "reply": "مسحتلك ملاحظة الجافا.", "action": { "type": "DELETE_NOTE", "payload": { "id": "معرف الملاحظة من البيانات الحالية" } } }
      
      - الطالب: "شكو عندي مهام؟"
        الرد: { "reply": "عندك 3 مهام، أهم وحدة هي...", "action": { "type": "NONE", "payload": {} } }
    `;

    // 3. الاتصال بالموديل (gemini-2.5-flash)
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const googleResponse = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          { role: "user", parts: [{ text: systemPrompt }] },
          ...messages
        ],
        generationConfig: { response_mime_type: "application/json" } // إجبار الرد بصيغة JSON
      })
    });

    const data = await googleResponse.json();

    if (!googleResponse.ok) {
      console.error("Google Error:", data);
      throw new Error(data.error?.message || 'خطأ من جوجل');
    }

    const textResponse = data.candidates[0].content.parts[0].text;
    return response.status(200).json(JSON.parse(textResponse));

  } catch (error) {
    console.error("Server Error:", error);
    return response.status(500).json({ error: error.message });
  }
}