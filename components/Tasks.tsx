
import React from 'react';
import { Task, Priority } from '../types';
import { ICONS } from '../constants';
import { useLanguage } from '../LanguageContext';
import Layout from './Layout';

declare global {
  interface Window {
    jspdf: any;
  }
}
declare const html2canvas: any;

interface TasksProps {
  tasks: Task[];
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (item?: Task) => void;
}

const PriorityBadge: React.FC<{ priority: Priority }> = ({ priority }) => {
  const colorClasses = {
    [Priority.High]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    [Priority.Medium]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    [Priority.Low]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  };
  return (
    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${colorClasses[priority]}`}>
      {priority}
    </span>
  );
};

const Tasks: React.FC<TasksProps> = ({ tasks, onToggleComplete, onDelete, onEdit }) => {
  const { t } = useLanguage();

  const handleExportPDF = () => {
    const { jsPDF } = window.jspdf;
    const tasksElement = document.getElementById('tasks-list');
    if (tasksElement) {
      html2canvas(tasksElement).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save("tasks-list.pdf");
      });
    }
  };


  console.log('[Tasks Component] Received tasks:', tasks.length, tasks);

  const getSafeDate = (dateStr: string | undefined): number => {
    if (!dateStr) return 0;
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? 0 : d.getTime();
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    // Sort by completion first (incomplete on top)
    const completionDiff = (a.completed ? 1 : 0) - (b.completed ? 1 : 0);
    if (completionDiff !== 0) return completionDiff;

    // Then by createdAt (newest first)
    const dateA = new Date(a.createdAt || 0).getTime();
    const dateB = new Date(b.createdAt || 0).getTime();
    return dateB - dateA;
  });

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">{t('tasks')}</h1>
        <div className="flex flex-col sm:flex-row gap-2">
          <button onClick={() => onEdit()} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-xl inline-flex items-center justify-center transition-colors shadow-sm">
            {ICONS.plus}
            <span className="ms-2">{t('addTask')}</span>
          </button>
        </div>
      </div>
      <div className="bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-2xl rounded-[32px] p-6 transition-colors duration-300">
        <div className="space-y-3">
          {sortedTasks.length === 0 && (
            <p className="text-center text-gray-500 py-10">No tasks found. Add a new task!</p>
          )}
          {sortedTasks.map(task => (
            <div key={task.id} className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-slate-50 dark:hover:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl bg-white dark:bg-white/5 backdrop-blur-md transition-all duration-200 group shadow-sm hover:shadow-md ${task.completed ? 'opacity-60 bg-slate-50 dark:bg-transparent' : ''}`}>
              <div className="flex items-center mb-2 sm:mb-0">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => onToggleComplete(task.id)}
                  className="h-5 w-5 rounded-md border-slate-300 dark:border-gray-500 text-indigo-600 focus:ring-indigo-500 cursor-pointer transition-colors"
                />
                <div className="ms-4">
                  <p className={`text-base font-medium ${task.completed ? 'text-slate-500 line-through decoration-slate-400' : 'text-slate-800 dark:text-white'}`}>{task.title}</p>
                  <p className="text-sm text-slate-500 dark:text-gray-400 mt-0.5">{t('due')}: {new Date(task.dueDate).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center justify-between sm:justify-end space-x-4 mt-2 sm:mt-0">
                <PriorityBadge priority={task.priority} />
                <div className="flex space-x-2">
                  <button onClick={() => onEdit(task)} className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-white/5 opacity-0 group-hover:opacity-100">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z" /></svg>
                  </button>
                  <button onClick={() => onDelete(task.id)} className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-white/5 opacity-0 group-hover:opacity-100">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Tasks;
