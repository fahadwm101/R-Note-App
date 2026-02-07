import { useState } from 'react';
import { Task, Note, Assignment, Priority } from '../types';

export const useSmartAssistant = (
  tasks: Task[], setTasks: React.Dispatch<React.SetStateAction<Task[]>>,
  notes: Note[], setNotes: React.Dispatch<React.SetStateAction<Note[]>>,
  assignments: Assignment[], setAssignments: React.Dispatch<React.SetStateAction<Assignment[]>>
) => {
  const [isAiLoading, setIsAiLoading] = useState(false);

  const sendToGemini = async (userMessage: string, chatHistory: any[]) => {
    setIsAiLoading(true);
    try {
      // 1. تجهيز ملخص البيانات (نرسل المفيد فقط لتوفير التوكنات)
      const currentData = {
        tasks: tasks.map(t => ({ id: t.id, title: t.title, date: t.dueDate })),
        notes: notes.map(n => ({ id: n.id, title: n.title })),
        assignments: assignments.map(a => ({ id: a.id, title: a.title, date: a.dueDate })),
      };

      // 2. الاتصال بالسيرفر
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...chatHistory, { role: 'user', parts: [{ text: userMessage }] }],
          currentData: currentData
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'فشل الاتصال بالمساعد');

      const { reply, action } = data;
      console.log("🔥 AI Action Received:", action); // للمراقبة في الكونسول

      // 3. تنفيذ الأوامر (مع شبكة أمان لتصحيح الأخطاء)
      if (action && action.type !== 'NONE') {
        const payload = action.payload || {};

        switch (action.type) {
          // --- إدارة المهام ---
          case 'ADD_TASK':
            const newTask: Task = {
              id: crypto.randomUUID(),
              title: payload.title || 'مهمة جديدة',
              completed: false,
              // ذكاء إضافي: نأخذ التاريخ بأي اسم يرسله الجيمناي
              dueDate: payload.date || payload.dueDate || new Date().toISOString().split('T')[0],
              priority: Priority.Medium 
            };
            setTasks(prev => [...prev, newTask]);
            break;

          case 'DELETE_TASK':
            // نحاول الحذف بالـ ID، وإذا فشل نحذف بالاسم
            if (payload.id) {
                setTasks(prev => prev.filter(t => t.id !== payload.id));
            } else if (payload.title) {
                setTasks(prev => prev.filter(t => !t.title.includes(payload.title)));
            }
            break;

          // --- إدارة الملاحظات ---
          case 'ADD_NOTE':
            const newNote: Note = {
              id: crypto.randomUUID(),
              title: payload.title || 'ملاحظة جديدة',
              // ذكاء إضافي: نأخذ المحتوى سواء سماه content أو text
              content: payload.content || payload.text || '', 
              subject: payload.subject || 'General',
              date: new Date().toISOString()
            };
            setNotes(prev => [...prev, newNote]);
            break;

          case 'DELETE_NOTE':
            if (payload.id) {
                setNotes(prev => prev.filter(n => n.id !== payload.id));
            }
            break;

          // --- إدارة الواجبات ---
          case 'ADD_ASSIGNMENT':
             const newAssign: Assignment = {
               id: crypto.randomUUID(),
               title: payload.title || 'واجب جديد',
               subject: payload.subject || 'General',
               dueDate: payload.date || payload.dueDate || new Date().toISOString(),
               description: payload.description || '',
               completed: false
             };
             setAssignments(prev => [...prev, newAssign]);
             break;

          case 'DELETE_ASSIGNMENT':
             if (payload.id) {
                 setAssignments(prev => prev.filter(a => a.id !== payload.id));
             }
             break;
        }
      }

      return reply;

    } catch (error) {
      console.error("AI Error:", error);
      return "آسف، صار عندي خلل بسيط. تأكد من النت وحاول مرة ثانية.";
    } finally {
      setIsAiLoading(false);
    }
  };

  return { sendToGemini, isAiLoading };
};
