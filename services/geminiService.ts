import { GoogleGenerativeAI } from "@google/generative-ai";
import { ChatMessage, Language, Task, Class, Note, Assignment, Quiz } from '../types';

// استدعاء المفتاح
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  console.warn("VITE_GEMINI_API_KEY environment variable not set.");
}

export const getGeminiResponse = async (history: ChatMessage[], newMessage: string, language: Language, data: { tasks: Task[], classes: Class[], notes: Note[], assignments: Assignment[], quizzes: Quiz[] }): Promise<string> => {
  if (!apiKey) {
    return "عذراً، لم يتم إعداد مفتاح API. الرجاء التواصل مع الدعم الفني.";
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  try {
    // استخدام الموديل المستقر
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // تحويل صيغة المحادثة لتتوافق مع المكتبة الجديدة
    // Google Generative AI requires 'user' and 'model' roles
    const historyForGemini = history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));

    // إعداد الشات
    const chat = model.startChat({
      history: historyForGemini,
      generationConfig: {
        maxOutputTokens: 1000,
      },
    });

    // تجهيز السياق (Context)
    const dataInfo = `إليك بيانات الطالب الحالية: مهام: ${JSON.stringify(data.tasks)}, دروس: ${JSON.stringify(data.classes)}, ملاحظات: ${JSON.stringify(data.notes)}, واجبات: ${JSON.stringify(data.assignments)}, اختبارات: ${JSON.stringify(data.quizzes)}`;

    const systemInstruction = `أنت مساعد طلابي ذكي اسمه R.Note AI. هدفك مساعدة الطالب في تنظيم وقته ودراسته. ${dataInfo}. تكلم باللهجة العراقية الودودة أو العربية الفصحى حسب لغة الطالب. كن مختصراً ومباشراً.`;

    // إرسال الرسالة (دمج التعليمات مع رسالة المستخدم لأن مكتبة الويب لا تدعم System Instruction بشكل مباشر في كل النسخ)
    const finalPrompt = `${systemInstruction}\n\nسؤال الطالب: ${newMessage}`;

    const result = await chat.sendMessage(finalPrompt);
    const response = result.response;
    return response.text();

  } catch (error) {
    console.error("Gemini Error:", error);
    return "آسف، صار عندي خلل بسيط بالاتصال. تأكد من النت وحاول مرة ثانية.";
  }
};