
import React from 'react';
import { Task, Priority } from '../types';
import { ICONS } from '../constants';
import { useLanguage } from '../LanguageContext';
import { motion } from 'framer-motion';
import Layout from './Layout';
import Card from './Card';

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

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 }
};

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
        if(tasksElement){
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


  const sortedTasks = [...tasks].sort((a, b) => (a.completed ? 1 : -1) - (b.completed ? 1 : -1) || new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  return (
    <Layout>
       <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{t('tasks')}</h1>
        <div className="flex flex-col sm:flex-row gap-2">
            <button onClick={() => onEdit()} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-xl inline-flex items-center justify-center">
                {ICONS.plus}
                <span className="ms-2">{t('addTask')}</span>
            </button>
        </div>
      </div>
      <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 shadow-2xl rounded-[32px] p-4">
        <motion.ul className="space-y-2" variants={containerVariants} initial="hidden" animate="visible">
          {sortedTasks.map(task => (
            <motion.li key={task.id} className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-white/5 hover:border-indigo-500/30 border border-white/5 rounded-xl bg-white/5 backdrop-blur-md group ${task.completed ? 'opacity-50' : ''}`} variants={itemVariants}>
              <div className="flex items-center mb-2 sm:mb-0">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => onToggleComplete(task.id)}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <div className="ms-4">
                  <p className={`text-sm font-medium ${task.completed ? 'text-gray-500' : 'text-gray-900 dark:text-white'}`}>{task.title}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t('due')}: {new Date(task.dueDate).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center justify-between sm:justify-end space-x-4">
                <PriorityBadge priority={task.priority} />
                <button onClick={() => onEdit(task)} className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-opacity">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z" /></svg>
                </button>
                <button onClick={() => onDelete(task.id)} className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-opacity">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </Layout>
  );
};

export default Tasks;
