
import React from 'react';
import { Quiz } from '../types';
import { ICONS } from '../constants';
import { useLanguage } from '../LanguageContext';

interface QuizzesProps {
  quizzes: Quiz[];
  onDelete: (id: string) => void;
  onEdit: (item?: Quiz) => void;
}

const Quizzes: React.FC<QuizzesProps> = ({ quizzes, onDelete, onEdit }) => {
  const { t } = useLanguage();
  const sortedQuizzes = [...quizzes].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const getCountdownBadge = (date: string) => {
    const today = new Date();
    const quizDate = new Date(date);
    const diffTime = quizDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return null;
    if (diffDays === 0) return <span className="rounded-full px-3 py-1 text-xs font-bold bg-red-500/20 text-red-400 animate-pulse">TODAY</span>;
    if (diffDays <= 3) return <span className="rounded-full px-3 py-1 text-xs font-bold bg-orange-500/20 text-orange-400">In {diffDays} Days</span>;
    return null;
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{t('quizzesAndExams')}</h1>
        <button onClick={() => onEdit()} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md inline-flex items-center">
          {ICONS.plus}
          <span className="ms-2">{t('addQuiz')}</span>
        </button>
      </div>
      <div className="bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-2xl rounded-[32px] overflow-hidden transition-colors duration-300">
        <table className="min-w-full divide-y border-slate-200 dark:border-white/5">
          <thead className="bg-slate-50 dark:bg-white/5">
            <tr>
              <th scope="col" className="px-6 py-3 text-start text-xs font-bold text-slate-500 dark:text-white/70 uppercase tracking-wider">{t('subject')}</th>
              <th scope="col" className="px-6 py-3 text-start text-xs font-bold text-slate-500 dark:text-white/70 uppercase tracking-wider">{t('date')}</th>
              <th scope="col" className="px-6 py-3 text-start text-xs font-bold text-slate-500 dark:text-white/70 uppercase tracking-wider">{t('studyMaterials')}</th>
              <th scope="col" className="relative px-6 py-3"><span className="sr-only">{t('edit')}</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/5">
            {sortedQuizzes.map(quiz => (
              <tr key={quiz.id} className="group hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap font-bold text-lg text-slate-800 dark:text-white">{quiz.subject}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-gray-400 flex items-center space-x-2">
                  <span>{new Date(quiz.date).toLocaleDateString()}</span>
                  {getCountdownBadge(quiz.date)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-gray-400">
                  {quiz.materialsUrl ?
                    <a href={quiz.materialsUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-white transition-colors">📎 {t('link')}</a> : <span className="opacity-50">{t('noMaterials')}</span>}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-end text-sm font-medium space-x-4">
                  <button onClick={() => onEdit(quiz)} className="opacity-0 group-hover:opacity-100 text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 transition-opacity">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z" /></svg>
                  </button>
                  <button onClick={() => onDelete(quiz.id)} className="opacity-0 group-hover:opacity-100 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-opacity">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Quizzes;
