import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ChatMessage, Language, Task, Class, Note, Assignment, Quiz } from '../types';

// 1. التصحيح هنا: استخدام import.meta.env بدلاً من process.env
// واستخدام الاسم الجديد الذي يبدأ بـ VITE_
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  console.warn("VITE_GEMINI_API_KEY environment variable not set. Gemini API calls will fail.");
}

// 2. تمرير المفتاح الصحيح
const ai = new GoogleGenAI({ apiKey: apiKey as string });

export const getGeminiResponse = async (history: ChatMessage[], newMessage: string, language: Language, data: { tasks: Task[], classes: Class[], notes: Note[], assignments: Assignment[], quizzes: Quiz[] }): Promise<string> => {
  try {
    // 3. ملاحظة: تأكد من اسم الموديل، حالياً النسخة المستقرة هي gemini-1.5-flash
    // إذا كان لديك وصول لـ 2.5 اتركه، لكن 1.5 أضمن للعمل
    const model = 'gemini-1.5-flash'; 
    
    const contents = history.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model', // تأكد من توافق الأدوار
        parts: [{ text: msg.text }]
    }));
    contents.push({ role: 'user', parts: [{ text: newMessage }] });

    const dataInfo = `إليك بياناتك الحالية: مهام: ${JSON.stringify(data.tasks)}, دروس: ${JSON.stringify(data.classes)}, ملاحظات: ${JSON.stringify(data.notes)}, واجبات: ${JSON.stringify(data.assignments)}, اختبارات: ${JSON.stringify(data.quizzes)}`;

    const systemInstruction = `أنت مساعد طلابي مفيد اسمك R.Note AI. يمكنك المساعدة في نصائح الدراسة وتلخيص النصوص وشرح المفاهيم وتنظيم المهام والمساعدة في إدارة الجدول الدراسي والملاحظات والواجبات. ${dataInfo} اجعل إجاباتك موجزة ومفيدة للطالب المشغول. قم بتنسيق ردودك باستخدام الماركداون. الرجاء الرد باللغة العربية.`;

    const fullContents = [
        { role: 'user', parts: [{ text: systemInstruction }] },
        { role: 'model', parts: [{ text: 'فهمت. أنا R.Note AI، مساعد الطلاب. كيف يمكنني مساعدتك اليوم؟' }] },
        ...contents
    ];

    const response: GenerateContentResponse = await ai.models.generateContent({
        model: model,
        contents: fullContents,
    });

    // التأكد من وجود نص في الرد
    return response.text ? response.text : "عذراً، لم أستطع توليد إجابة.";
    
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return "واجهت مشكلة في الاتصال بالذكاء الاصطناعي. يرجى التحقق من المفتاح أو الاتصال بالإنترنت.";
  }
};
