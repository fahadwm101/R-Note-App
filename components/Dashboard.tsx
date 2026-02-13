
import React, { useEffect, useState } from 'react';
import { Task, Quiz, Note, Priority, ModalContent } from '../types';
import { ICONS } from '../constants';
import { useLanguage } from '../LanguageContext';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import Layout from './Layout';

interface DashboardProps {
    tasks: Task[];
    quizzes: Quiz[];
    notes: Note[];
    streak: number;
    openModal: (view: ModalContent['view']) => void;
}

const today = new Date().toISOString().split('T')[0];


const PriorityBadge: React.FC<{ priority: Priority }> = ({ priority }) => {
    const colorClasses = {
        [Priority.High]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
        [Priority.Medium]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
        [Priority.Low]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    };
    return (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${colorClasses[priority]}`}>
            {priority}
        </span>
    );
};

const Dashboard: React.FC<DashboardProps> = ({ tasks = [], quizzes = [], notes = [], streak = 0, openModal }) => {
    const { t, language } = useLanguage();
    const [showSuggestion, setShowSuggestion] = useState(false);

    useEffect(() => {
        const upcomingQuizzes = (quizzes || []).filter(q => {
            if (!q.date) return false;
            const quizDate = new Date(q.date);
            if (isNaN(quizDate.getTime())) return false;

            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const twoDaysFromNow = new Date();
            twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);

            return quizDate > tomorrow && quizDate < twoDaysFromNow;
        });

        // Removed alert for upcoming quizzes
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [quizzes]);

    const getSmartSuggestion = () => {
        const incompleteTasks = (tasks || []).filter(task => !task.completed);
        const sortedTasks = incompleteTasks.sort((a, b) => {
            // Priority: High > Medium > Low
            const priorityOrder = { High: 3, Medium: 2, Low: 1 };
            const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
            if (priorityDiff !== 0) return priorityDiff;
            // Then by due date
            const dateA = a.dueDate ? new Date(a.dueDate).getTime() : 0;
            const dateB = b.dueDate ? new Date(b.dueDate).getTime() : 0;
            return dateA - dateB;
        });
        return sortedTasks[0];
    };

    const suggestedTask = getSmartSuggestion();

    const todaysTasks = (tasks || []).filter(task => task.dueDate === today && !task.completed);
    const upcomingQuizzes = (quizzes || []).filter(quiz => {
        if (!quiz.date) return false;
        const date = new Date(quiz.date);
        return !isNaN(date.getTime()) && date >= new Date();
    }).slice(0, 3);

    const recentNotes = (notes || []).sort((a, b) => {
        const timeA = a.lastUpdated ? new Date(a.lastUpdated).getTime() : 0;
        const timeB = b.lastUpdated ? new Date(b.lastUpdated).getTime() : 0;
        return timeB - timeA;
    }).slice(0, 3);

    const totalTasks = (tasks || []).length;
    const taskCompletionData = [
        { name: t('completed'), value: (tasks || []).filter(t => t.completed).length, color: '#10b981' },
        { name: t('pending'), value: (tasks || []).filter(t => !t.completed).length, color: '#f59e0b' }
    ];

    return (
        <Layout>
            {/* Main 2-Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-7 gap-8">
                {/* Left Column - Main Content (70% width) */}
                <div className="lg:col-span-5 space-y-8">
                    {/* Hero CTA Section */}
                    <div className="bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 backdrop-blur-xl border border-purple-500/30 rounded-2xl shadow-[0_0_30px_rgba(147,51,234,0.2)] p-8 text-center">
                        <h2 className="text-3xl font-bold text-white mb-4 flex items-center justify-center gap-2">{ICONS.target} {t('whatShouldIStudyNow')}</h2>
                        <p className="text-white/80 mb-6">Get personalized study recommendations based on your priorities</p>
                        <button
                            onClick={() => setShowSuggestion(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-xl text-lg shadow-lg shadow-blue-500/50 transition-all duration-200 transform hover:scale-105"
                        >
                            {ICONS.rocket} {t('whatShouldIStudyNow')}
                        </button>
                    </div>

                    {/* Main Cards Grid */}
                    <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                        {/* Today's Tasks */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex flex-col border border-white/10 h-full">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">{t('todaysTasks')}</h2>
                                <button onClick={() => openModal('tasks')} className="text-gray-400 hover:text-white p-1 rounded-full transition-colors">
                                    {ICONS.plus}
                                </button>
                            </div>
                            <div className="flex-grow">
                                {todaysTasks.length > 0 ? (
                                    <div className="space-y-3">
                                        {todaysTasks.map(task => (
                                            <div key={task.id} className="flex items-center px-4 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors justify-between">
                                                <span className="text-gray-800 dark:text-gray-300">{task.title}</span>
                                                <PriorityBadge priority={task.priority} />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 dark:text-gray-400">{t('noTasksDueToday')}</p>
                                )}
                            </div>
                        </div>

                        {/* Upcoming Quizzes */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex flex-col border border-white/10 h-full">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">{t('upcomingQuizzes')}</h2>
                                <button onClick={() => openModal('quizzes')} className="text-gray-400 hover:text-white p-1 rounded-full transition-colors">
                                    {ICONS.plus}
                                </button>
                            </div>
                            <div className="flex-grow">
                                {upcomingQuizzes.length > 0 ? (
                                    <div className="space-y-3">
                                        {upcomingQuizzes.map(quiz => (
                                            <div key={quiz.id} className="flex items-center px-4 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors justify-between">
                                                <div>
                                                    <p className="font-medium text-gray-800 dark:text-gray-300">{quiz.subject}</p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(quiz.date).toLocaleDateString()}</p>
                                                </div>
                                                {quiz.materialsUrl && <a href={quiz.materialsUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300">{t('materials')}</a>}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 dark:text-gray-400">{t('noUpcomingQuizzes')}</p>
                                )}
                            </div>
                        </div>

                        {/* Recent Notes */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex flex-col border border-white/10 h-full">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">{t('recentNotes')}</h2>
                                <button onClick={() => openModal('notes')} className="text-gray-400 hover:text-white p-1 rounded-full transition-colors">
                                    {ICONS.plus}
                                </button>
                            </div>
                            <div className="flex-grow">
                                {recentNotes.length > 0 ? (
                                    <div className="space-y-3">
                                        {recentNotes.map(note => (
                                            <div key={note.id} className="flex items-center px-4 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                                <div>
                                                    <p className="font-medium text-gray-800 dark:text-gray-300 truncate">{note.title}</p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">{note.subject}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 dark:text-gray-400">{t('noNotesYet')}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Secondary Content (30% width) */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Study Streak */}
                    <div className="bg-white/5 backdrop-blur-2xl rounded-xl shadow-[0_0_30px_rgba(249,115,22,0.15)] border border-orange-500/40 p-6 text-white">
                        <div className="text-center">
                            <div className="text-4xl mb-2">🔥</div>
                            <h3 className="text-lg font-bold text-orange-100 mb-1">{t('studyStreak')}</h3>
                            <p className="text-2xl font-bold text-orange-200">{streak}</p>
                            <p className="text-sm text-orange-300">{streak === 1 ? t('daysInARow') : t('daysInARowPlural')}</p>
                        </div>
                    </div>

                    {/* Task Progress Chart */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-white/10">
                        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4 text-center">{t('taskProgress')}</h3>
                        <div className="flex justify-center">
                            <ResponsiveContainer width={180} height={180}>
                                <PieChart>
                                    <Pie
                                        data={taskCompletionData}
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={70}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {taskCompletionData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        {/* Legend */}
                        <div className="flex justify-center space-x-4 mt-4">
                            {taskCompletionData.map((entry, index) => (
                                <div key={index} className="flex items-center space-x-1">
                                    <div
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: entry.color }}
                                    ></div>
                                    <span className="text-gray-600 dark:text-gray-300 text-xs">
                                        {entry.name}: {entry.value} ({totalTasks > 0 ? Math.round((entry.value / totalTasks) * 100) : 0}%)
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Suggestion Modal */}
            {showSuggestion && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-black/30 backdrop-blur-xl rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-xl font-bold mb-4 text-white">{t('smartSuggestion')}</h3>
                        {suggestedTask ? (
                            <div>
                                <div className="flex items-center px-4 py-2 text-sm rounded-md bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 mb-4">
                                    {ICONS.tasks}
                                    <span className="ms-3">{suggestedTask.title}</span>
                                </div>
                                <p className="mb-2 text-sm"><strong>{t('priorityLabel')}</strong> {suggestedTask.priority}</p>
                                <p className="mb-4 text-sm"><strong>{t('dueLabel')}</strong> {new Date(suggestedTask.dueDate).toLocaleDateString()}</p>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => {
                                            setShowSuggestion(false);
                                            openModal('tasks');
                                        }}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded text-sm"
                                    >
                                        {t('editTask')}
                                    </button>
                                    <button
                                        onClick={() => setShowSuggestion(false)}
                                        className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded text-sm"
                                    >
                                        {t('close')}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center">
                                <p className="text-white mb-6 font-medium text-lg">{t('noPendingTasks')}</p>
                                <button
                                    onClick={() => setShowSuggestion(false)}
                                    className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-8 rounded-lg text-sm transition-colors shadow-lg"
                                >
                                    {t('close')}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default Dashboard;
