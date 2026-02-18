
import React from 'react';
import Layout from './Layout';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Task, Assignment, Quiz, Class } from '../types';
import { ICONS } from '../constants';
import { useLanguage } from '../LanguageContext';
import { Link } from 'react-router-dom';

interface AnalyticsProps {
    tasks: Task[];
    assignments: Assignment[];
    quizzes: Quiz[];
    classes: Class[];
    streak: number;
}

const Analytics: React.FC<AnalyticsProps> = ({ tasks, assignments, quizzes, classes, streak }) => {
    const { t, language } = useLanguage();

    const isRTL = language === 'ar';

    // 1. Task Completion Data
    const completedTasks = tasks.filter(t => t.completed).length;
    const pendingTasks = tasks.length - completedTasks;
    const taskData = [
        { name: t('completed'), value: completedTasks },
        { name: t('pending'), value: pendingTasks },
    ];
    const COLORS = ['#10B981', '#F59E0B']; // Green, Amber

    // 2. Assignments Status
    // Assume 'Submitted' if check logic exists, but default to simple count for now.
    // In types.ts, Assignment has 'status'.
    const submittedAssignments = assignments.filter(a => a.status === 'Submitted').length;
    const pendingAssignments = assignments.length - submittedAssignments;
    const assignmentData = [
        { name: t('submitted'), value: submittedAssignments },
        { name: t('pending'), value: pendingAssignments },
    ];
    const ASSIGNMENT_COLORS = ['#3B82F6', '#EF4444']; // Blue, Red

    // 3. Classes Distribution (by Day)
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday'];
    const classDistribution = days.map(day => ({
        name: t(day),
        classes: classes.filter(c => c.day.toLowerCase() === day).length
    }));

    return (
        <Layout>
            <div className="animate-fadeIn pb-20">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        {ICONS.analytics} {t('advancedAnalytics')}
                    </h1>
                    <Link to="/dashboard" className="flex items-center text-sm text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 me-1 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        {t('backToDashboard')}
                    </Link>
                </div>

                {/* Top Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wider">{t('studyStreak')}</div>
                        <div className="mt-2 text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                            {streak} <span className="text-lg text-gray-400">🔥 {t('daysInARowPlural')}</span>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wider">{t('taskProgress')}</div>
                        <div className="mt-2 text-3xl font-extrabold text-gray-800 dark:text-white">{tasks.length}</div>
                        <div className="text-xs text-green-500 mt-1">{completedTasks} {t('completed')}</div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wider">{t('assignments')}</div>
                        <div className="mt-2 text-3xl font-extrabold text-gray-800 dark:text-white">{assignments.length}</div>
                        <div className="text-xs text-blue-500 mt-1">{submittedAssignments} {t('submitted')}</div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wider">{t('quizzes')}</div>
                        <div className="mt-2 text-3xl font-extrabold text-gray-800 dark:text-white">{quizzes.length}</div>
                        <div className="text-xs text-red-500 mt-1">{t('upcomingQuizzes')}</div>
                    </div>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Task Completion Pie Chart */}
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">{t('taskCompletionRate')}</h3>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={taskData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {taskData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6' }} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Class Load Bar Chart */}
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">{t('weeklyClassLoad')}</h3>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={classDistribution}>
                                    <XAxis dataKey="name" stroke="#9CA3AF" />
                                    <YAxis stroke="#9CA3AF" />
                                    <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6' }} />
                                    <Bar dataKey="classes" fill="#6366F1" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Assignment Status Pie Chart */}
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">{t('assignmentSubmissionStatus')}</h3>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={assignmentData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {assignmentData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={ASSIGNMENT_COLORS[index % ASSIGNMENT_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6' }} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Focus/Generic Placeholder (since we don't have deep focus data) */}
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-xl shadow-lg text-white flex flex-col justify-center items-center text-center">
                        <h3 className="text-xl font-bold mb-2">{t('keepUpWork')}</h3>
                        <p className="opacity-90 max-w-xs">{t('consistencyMessage').replace('{completedTasks}', completedTasks.toString()).replace('{streak}', streak.toString())}</p>
                        <div className="mt-6 p-4 bg-white/20 backdrop-blur-sm rounded-lg">
                            <span className="text-3xl font-mono font-bold tracking-widest">
                                {Math.round((completedTasks / (tasks.length || 1)) * 100)}%
                            </span>
                            <div className="text-xs uppercase tracking-wider mt-1">{t('completionRate')}</div>
                        </div>
                    </div>

                </div>
            </div>
        </Layout>
    );
};

export default Analytics;
