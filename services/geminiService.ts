import { ChatMessage, Language, Task, Class, Note, Assignment, Quiz } from '../types';

// لاحظ: ما نحتاج نستدعي مكتبة جوجل هنا، لأن الشغل كله صار بالسيرفر

export const getGeminiResponse = async (history: ChatMessage[], newMessage: string, language: Language, data: { tasks: Task[], classes: Class[], notes: Note[], assignments: Assignment[], quizzes: Quiz[] }): Promise<string> => {
  try {
    // 1. ترتيب البيانات عشان السيرفر يفهمها
    const dataInfo = `بيانات الطالب: مهام: ${JSON.stringify(data.tasks)}, دروس: ${JSON.stringify(data.classes)}, ملاحظات: ${JSON.stringify(data.notes)}`;
    
    // تحويل المحادثة لنص بسيط
    const chatHistoryText = history.map(msg => `${msg.role === 'user' ? 'الطالب' : 'المساعد'}: ${msg.text}`).join('\n');
    
    // الرسالة الكاملة اللي راح نرسلها
    const fullPrompt = `
      أنت R.Note AI، مساعد طلابي ذكي.
      ${dataInfo}
      
      تاريخ المحادثة السابقة:
      ${chatHistoryText}
      
      سؤال الطالب الجديد: ${newMessage}
      
      جاوب باختصار وفائدة باللهجة العراقية أو العربية الفصحى.
    `;

    // 2. الاتصال بسيرفرنا الخاص (api/gemini)
    const response = await fetch('/api/gemini', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt: fullPrompt }),
    });

    if (!response.ok) {
      throw new Error('فشل الاتصال بالسيرفر');
    }

    const json = await response.json();
    return json.text;

  } catch (error) {
    console.error("Error calling internal API:", error);
    return "آسف، السيرفر ما جاوبني. حاول مرة ثانية.";
  }
};
