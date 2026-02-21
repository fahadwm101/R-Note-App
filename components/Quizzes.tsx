
import React, { useState } from 'react';
import { Quiz } from '../types';
import { ICONS } from '../constants';
import { useLanguage } from '../LanguageContext';
import { IS_RAMADAN } from '../src/config/theme';
import PageTour from './PageTour';
import ConfirmDialog from './ui/ConfirmDialog';

interface QuizzesProps {
  quizzes: Quiz[];
  onDelete: (id: string) => void;
  onEdit: (item?: Quiz) => void;
  searchQuery?: string;
}

const Quizzes: React.FC<QuizzesProps> = ({ quizzes, onDelete, onEdit, searchQuery = '' }) => {
  const { t } = useLanguage();
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const sortedQuizzes = [...quizzes]
    .filter(q => !searchQuery || q.subject.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const getCountdownBadge = (date: string) => {
    const today = new Date();
    const quizDate = new Date(date);
    const diffTime = quizDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return null;
    if (diffDays === 0) return <span className="rounded-full px-2 py-0.5 text-[10px] font-bold bg-red-500/20 text-red-500 dark:text-red-400 animate-pulse uppercase">Today</span>;
    if (diffDays <= 3) return <span className="rounded-full px-2 py-0.5 text-[10px] font-bold bg-amber-500/20 text-amber-600 dark:text-amber-400 uppercase">{diffDays} Days Left</span>;
    return null;
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {deleteTarget && (
        <ConfirmDialog
          message={t('confirmDeleteQuiz') || 'Delete this quiz?'}
          onConfirm={() => { onDelete(deleteTarget); setDeleteTarget(null); }}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
      <PageTour
        pageKey="quizzes"
        title={t('tourQuizzesTitle')}
        description={t('tourQuizzesDesc')}
        features={t('tourQuizzesFeatures').split(',')}
      />
      <div className="flex justify-between items-center mb-6">
        <h1 className={`text-2xl sm:text-3xl font-bold ${IS_RAMADAN ? 'text-gold-gradient' : 'text-gray-800 dark:text-white'}`}>{t('quizzesAndExams')}</h1>
        <button onClick={() => onEdit()} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-xl inline-flex items-center justify-center transition-colors shadow-sm shadow-indigo-500/20 active:scale-95">
          {ICONS.plus}
          <span className="ms-2 hidden sm:inline">{t('addQuiz')}</span>
        </button>
      </div>

      {/* Desktop Table View (Hidden on Mobile) */}
      <div className="hidden md:block">
        <div className={`backdrop-blur-xl border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-2xl rounded-[32px] overflow-hidden transition-colors duration-300 ${IS_RAMADAN ? 'card-royal' : 'bg-white dark:bg-slate-900/60'}`}>
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
              {sortedQuizzes.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-slate-400">{t('noQuizzes')}</td>
                </tr>
              ) : (
                sortedQuizzes.map(quiz => (
                  <tr key={quiz.id} className="group hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-lg text-slate-800 dark:text-white">{quiz.subject}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-gray-400">
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <span>{new Date(quiz.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        {getCountdownBadge(quiz.date)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-gray-400">
                      {quiz.materialsUrl ?
                        <a href={quiz.materialsUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-white transition-colors">📎 {t('link')}</a> : <span className="opacity-50">{t('noMaterials')}</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-end text-sm font-medium">
                      <div className="flex items-center justify-end space-x-3 rtl:space-x-reverse">
                        <button onClick={() => onEdit(quiz)} className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-white/10" title={t('edit')}>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z" /></svg>
                        </button>
                        <button onClick={() => setDeleteTarget(quiz.id)} className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-white/10" title={t('delete')}>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View (Shown on Mobile) */}
      <div className="md:hidden space-y-4">
        {sortedQuizzes.length === 0 ? (
          <div className="card-royal rounded-[24px] p-8 text-center text-slate-400">
            {t('noQuizzes')}
          </div>
        ) : (
          sortedQuizzes.map(quiz => (
            <div key={quiz.id} className={`card-royal rounded-[24px] p-5 shadow-lg border border-slate-200 dark:border-white/10 ${IS_RAMADAN ? 'bg-slate-900/40' : 'bg-white dark:bg-slate-900/60'}`}>
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white leading-tight">{quiz.subject}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-slate-500 dark:text-gray-400">{new Date(quiz.date).toLocaleDateString()}</span>
                    {getCountdownBadge(quiz.date)}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100 dark:border-white/5">
                <div>
                  {quiz.materialsUrl ? (
                    <a href={quiz.materialsUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
                      {t('link')}
                    </a>
                  ) : (
                    <span className="text-sm text-slate-400 dark:text-gray-600">{t('noMaterials')}</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => onEdit(quiz)} className="bg-slate-100 dark:bg-white/5 p-2 rounded-xl text-slate-500 dark:text-gray-300 active:scale-90 transition-transform">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z" /></svg>
                  </button>
                  <button onClick={() => setDeleteTarget(quiz.id)} className="bg-red-50 dark:bg-red-900/20 p-2 rounded-xl text-red-500 active:scale-90 transition-transform">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Quizzes;
