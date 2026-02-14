
import React from 'react';
import { Assignment, SubmissionStatus } from '../types';
import { ICONS } from '../constants';
import { useLanguage } from '../LanguageContext';
import PageTour from './PageTour';

interface AssignmentsProps {
  assignments: Assignment[];
  onDelete: (id: string) => void;
  onEdit: (item?: Assignment) => void;
}

const StatusBadge: React.FC<{ status: SubmissionStatus }> = ({ status }) => {
  const { t } = useLanguage();
  const colorClasses = status === SubmissionStatus.Submitted
    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
  return (
    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${colorClasses}`}>
      {status === SubmissionStatus.Submitted ? t('submitted') : t('notSubmitted')}
    </span>
  );
};

const Assignments: React.FC<AssignmentsProps> = ({ assignments, onDelete, onEdit }) => {
  const { t } = useLanguage();

  const getDueDateColor = (assignment: Assignment) => {
    if (assignment.status === SubmissionStatus.Submitted) return 'text-green-400';
    const daysLeft = Math.ceil((new Date(assignment.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (daysLeft > 3) return 'text-gray-400';
    return 'text-red-500';
  };
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <PageTour
        pageKey="assignments"
        title={t('tourAssignmentsTitle')}
        description={t('tourAssignmentsDesc')}
        features={t('tourAssignmentsFeatures').split(',')}
      />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{t('assignments')}</h1>
        <button onClick={() => onEdit()} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md inline-flex items-center">
          {ICONS.plus}
          <span className="ms-2">{t('addAssignment')}</span>
        </button>
      </div>
      <div className="space-y-4">
        {assignments.map(assignment => (
          <div key={assignment.id} className={`bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-2xl rounded-[32px] p-6 transition-colors duration-300 ${assignment.status === SubmissionStatus.Submitted ? 'opacity-60 bg-slate-50 dark:bg-slate-900/40' : ''}`}>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">{assignment.title} <span className="mx-2 text-slate-300 dark:text-slate-600">|</span> <span className="text-base font-normal text-slate-500 dark:text-white/70">{assignment.subject}</span></h3>
                <p className="mt-1 text-sm text-slate-600 dark:text-white/80 leading-relaxed">{assignment.description}</p>
                <p className={`mt-3 text-sm font-medium ${getDueDateColor(assignment)}`}>{t('due')}: {new Date(assignment.dueDate).toLocaleString()}</p>
              </div>
              <StatusBadge status={assignment.status} />
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  {assignment.status === SubmissionStatus.Submitted ? (
                    <span className="text-green-600 dark:text-green-400 text-sm font-bold flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                      {t('submitted')}
                    </span>
                  ) : (
                    <span className="text-yellow-600 dark:text-yellow-400 text-sm font-bold flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      {t('notSubmitted')}
                    </span>
                  )}
                </div>
                <div className="flex space-x-4">
                  <button onClick={() => onEdit(assignment)} className="text-sm font-medium text-slate-400 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors">{t('edit')}</button>
                  <button onClick={() => onDelete(assignment.id)} className="text-sm font-medium text-slate-400 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors">{t('delete')}</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Assignments;
