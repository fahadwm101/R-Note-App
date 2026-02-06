
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ChatMessage, Language, Task, Class, Note, Assignment, Quiz } from '../types';

if (!process.env.GEMINI_API_KEY) {
  // This is a placeholder check. The actual key is expected to be in the environment.
  console.warn("GEMINI_API_KEY environment variable not set. Gemini API calls will fail.");
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

export const getGeminiResponse = async (history: ChatMessage[], newMessage: string, language: Language, data: { tasks: Task[], classes: Class[], notes: Note[], assignments: Assignment[], quizzes: Quiz[] }): Promise<string> => {
  try {
    const model = 'gemini-2.5-flash';
    const contents = history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }]
    }));
    contents.push({ role: 'user', parts: [{ text: newMessage }] });

    const dataInfo = `إليك بياناتك الحالية: مهام: ${JSON.stringify(data.tasks)}, دروس: ${JSON.stringify(data.classes)}, ملاحظات: ${JSON.stringify(data.notes)}, واجبات: ${JSON.stringify(data.assignments)}, اختبارات: ${JSON.stringify(data.quizzes)}`;

    const systemInstruction = `أنت مساعد طلابي مفيد اسمك R.Note AI. يمكنك المساعدة في نصائح الدراسة وتلخيص النصوص وشرح المفاهيم وتنظيم المهام والمساعدة في إدارة الجدول الدراسي والملاحظات والواجبات. ${dataInfo} اجعل إجاباتك موجزة ومفيدة للطالب المشغول. قم بتنسيق ردودك باستخدام الماركداون. الرجاء الرد باللغة العربية.`;

    // Add system instruction as the first message
    const fullContents = [
        { role: 'user', parts: [{ text: systemInstruction }] },
        { role: 'model', parts: [{ text: 'فهمت. أنا R.Note AI، مساعد الطلاب. كيف يمكنني مساعدتك اليوم؟' }] },
        ...contents
    ];

    // FIX: Pass the constructed contents array directly to maintain chat history structure.
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: model,
        contents: fullContents,
    });

    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return "Sorry, I encountered an error. Please check the console for details.";
  }
};
