export default async function handler(request, response) {
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (request.method === 'OPTIONS') return response.status(200).end();

  const apiKey = process.env.VITE_GEMINI_API_KEY;
  if (!apiKey) return response.status(500).json({ error: 'API Key missing' });

  try {
    const { prompt } = request.body;
    
    // نستخدم gemini-pro لأنه الأضمن حالياً
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;

    const googleResponse = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });

    const data = await googleResponse.json();

    if (!googleResponse.ok) {
      return response.status(500).json({ error: data.error?.message || 'Google Error' });
    }

    const text = data.candidates[0].content.parts[0].text;
    return response.status(200).json({ text });

  } catch (error) {
    return response.status(500).json({ error: error.message });
  }
}
