
import React, { useState } from 'react';
import { format, startOfWeek, addDays, startOfMonth, endOfMonth, endOfWeek, isSameMonth, isSameDay, addMonths, subMonths, isToday } from 'date-fns';
import { Task, Quiz, Assignment, Class } from '../types';
import { ICONS } from '../constants';
import { useLanguage } from '../LanguageContext';

interface CalendarViewProps {
    tasks: Task[];
    quizzes: Quiz[];
    assignments: Assignment[];
    classes: Class[];
}

const CalendarView: React.FC<CalendarViewProps> = ({ tasks, quizzes, assignments, classes }) => {
    const { t } = useLanguage();
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

    const renderHeader = () => {
        const dateFormat = t('dateFormat') || "MMMM yyyy";

        return (
            <div className="flex justify-between items-center mb-6 px-2">
                <div className="text-xl font-bold dark:text-gray-100 flex items-center gap-2">
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/40 rounded-lg text-indigo-600 dark:text-indigo-400">
                        {ICONS.calendar}
                    </div>
                    {format(currentMonth, dateFormat)}
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <button onClick={() => setCurrentMonth(new Date())} className="px-3 py-1 text-sm bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-md font-medium">
                        {t('today') || 'Today'}
                    </button>
                    <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </button>
                </div>
            </div>
        );
    };

    const renderDays = () => {
        const days = [];
        const dateFormat = "EEEE";
        const startDate = startOfWeek(currentMonth);

        for (let i = 0; i < 7; i++) {
            days.push(
                <div key={i} className="text-center font-medium text-gray-400 dark:text-gray-500 text-sm py-2">
                    {t(format(addDays(startDate, i), dateFormat).toLowerCase()) || format(addDays(startDate, i), dateFormat)}
                </div>
            );
        }

        return <div className="grid grid-cols-7 mb-2 border-b border-gray-200 dark:border-gray-700">{days}</div>;
    };

    const renderCells = () => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart);
        const endDate = endOfWeek(monthEnd);

        const rows = [];
        let days = [];
        let day = startDate;
        let formattedDate = "";

        while (day <= endDate) {
            for (let i = 0; i < 7; i++) {
                formattedDate = format(day, "d");
                const cloneDay = day;

                // Collect events for this day
                const dayTasks = tasks.filter(task => isSameDay(new Date(task.dueDate), cloneDay));
                const dayQuizzes = quizzes.filter(quiz => isSameDay(new Date(quiz.date), cloneDay));
                const dayAssignments = assignments.filter(assignment => isSameDay(new Date(assignment.dueDate), cloneDay));

                // Check if there are classes today (based on day name)
                const dayName = format(cloneDay, 'EEEE');
                const rawDayClasses = classes.filter(cls => cls.day.toLowerCase() === dayName.toLowerCase());

                // Deduplicate classes based on TIME only (pick the one with longest subject)
                const uniqueClassesMap = new Map();
                rawDayClasses.forEach(cls => {
                    const timeKey = (cls.time || '').trim();
                    if (!uniqueClassesMap.has(timeKey)) {
                        uniqueClassesMap.set(timeKey, cls);
                    } else {
                        const existing = uniqueClassesMap.get(timeKey);
                        if ((cls.subject || '').length > (existing.subject || '').length) {
                            uniqueClassesMap.set(timeKey, cls);
                        }
                    }
                });
                const dayClasses = Array.from(uniqueClassesMap.values());

                const hasEvents = dayTasks.length > 0 || dayQuizzes.length > 0 || dayAssignments.length > 0 || dayClasses.length > 0;
                const isSelected = selectedDate && isSameDay(day, selectedDate);

                days.push(
                    <div
                        key={day.toString()}
                        className={`min-h-[100px] border border-gray-100 dark:border-gray-800 p-2 transition-all hover:bg-gray-50 dark:hover:bg-slate-900/50 cursor-pointer relative
                            ${!isSameMonth(day, monthStart) ? "bg-gray-50/50 dark:bg-black/20 text-gray-300 dark:text-gray-700" : ""}
                            ${isToday(day) ? "bg-indigo-50/30 dark:bg-indigo-900/10" : ""}
                            ${isSelected ? "ring-2 ring-inset ring-indigo-500" : ""}
                        `}
                        onClick={() => setSelectedDate(cloneDay)}
                    >
                        <div className="flex justify-between items-start">
                            <span className={`text-sm font-medium h-7 w-7 flex items-center justify-center rounded-full
                                ${isToday(day)
                                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/30"
                                    : "text-gray-700 dark:text-gray-300"
                                }`}>
                                {formattedDate}
                            </span>
                            {hasEvents && (
                                <div className="flex gap-1">
                                    {dayTasks.length > 0 && <span className="h-2 w-2 rounded-full bg-green-500" title="Tasks"></span>}
                                    {dayQuizzes.length > 0 && <span className="h-2 w-2 rounded-full bg-red-500" title="Quizzes"></span>}
                                    {dayAssignments.length > 0 && <span className="h-2 w-2 rounded-full bg-orange-500" title="Assignments"></span>}
                                    {dayClasses.length > 0 && <span className="h-2 w-2 rounded-full bg-blue-500" title="Classes"></span>}
                                </div>
                            )}
                        </div>

                        <div className="mt-2 space-y-1 overflow-y-auto max-h-[80px] custom-scrollbar">
                            {/* Limit shown items to 3 to avoid clutter, else show +X more */}
                            {dayQuizzes.map(q => (
                                <div key={q.id} className="text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-1.5 py-0.5 rounded truncate border-l-2 border-red-500">
                                    {t('quiz')}: {q.subject}
                                </div>
                            ))}
                            {dayAssignments.map(a => (
                                <div key={a.id} className="text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-1.5 py-0.5 rounded truncate border-l-2 border-orange-500">
                                    {t('assignment')}: {a.subject}
                                </div>
                            ))}
                            {dayClasses.map(c => (
                                <div key={c.id} className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded truncate border-l-2 border-blue-500">
                                    {c.time} - {c.subject}
                                </div>
                            ))}
                            {dayTasks.map(taskItem => (
                                <div key={taskItem.id} className={`text-xs px-1.5 py-0.5 rounded truncate border-l-2 ${taskItem.completed ? 'bg-gray-100 text-gray-500 border-gray-400 line-through' : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-500'}`}>
                                    {t('task')}: {taskItem.title}
                                </div>
                            ))}
                        </div>
                    </div>
                );
                day = addDays(day, 1);
            }
            rows.push(
                <div key={day.toString()} className="grid grid-cols-7">
                    {days}
                </div>
            );
            days = [];
        }
        return <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">{rows}</div>;
    };

    const renderSelectedDayDetails = () => {
        if (!selectedDate) return null;

        // Filter events for selected date
        const dayTasks = tasks.filter(task => isSameDay(new Date(task.dueDate), selectedDate));
        const dayQuizzes = quizzes.filter(quiz => isSameDay(new Date(quiz.date), selectedDate));
        const dayAssignments = assignments.filter(assignment => isSameDay(new Date(assignment.dueDate), selectedDate));
        const dayName = format(selectedDate, 'EEEE');
        const rawDayClasses = classes.filter(cls => cls.day.toLowerCase() === dayName.toLowerCase());

        // Deduplicate classes based on TIME only (pick the one with longest subject)
        const uniqueClassesMap = new Map();
        rawDayClasses.forEach(cls => {
            const timeKey = (cls.time || '').trim();
            if (!uniqueClassesMap.has(timeKey)) {
                uniqueClassesMap.set(timeKey, cls);
            } else {
                const existing = uniqueClassesMap.get(timeKey);
                if ((cls.subject || '').length > (existing.subject || '').length) {
                    uniqueClassesMap.set(timeKey, cls);
                }
            }
        });
        const dayClasses = Array.from(uniqueClassesMap.values());

        const hasEvents = dayTasks.length > 0 || dayQuizzes.length > 0 || dayAssignments.length > 0 || dayClasses.length > 0;

        return (
            <div className="mt-6 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 animate-fadeIn">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-indigo-500"></span>
                    {t('eventsFor')} {format(selectedDate, "eeee, MMMM do, yyyy")}
                </h3>

                {!hasEvents ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400 italic">
                        {t('noEventsScheduled')}
                        <p className="text-xs mt-1">{t('enjoyFreeTime')} 🎉</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {dayQuizzes.length > 0 && (
                            <div>
                                <h4 className="text-xs font-bold text-red-500 uppercase tracking-wider mb-2">{t('quizzesAndExams')}</h4>
                                <div className="space-y-2">
                                    {dayQuizzes.map(q => (
                                        <div key={q.id} className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-900/30">
                                            <span className="font-medium text-gray-800 dark:text-gray-200">{q.subject}</span>
                                            {q.materialsUrl && <a href={q.materialsUrl} target="_blank" rel="noreferrer" className="text-xs text-red-600 hover:underline">{t('studyMaterials')}</a>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {dayAssignments.length > 0 && (
                            <div>
                                <h4 className="text-xs font-bold text-orange-500 uppercase tracking-wider mb-2">{t('assignmentsDue')}</h4>
                                <div className="space-y-2">
                                    {dayAssignments.map(a => (
                                        <div key={a.id} className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-100 dark:border-orange-900/30">
                                            <div className="flex justify-between">
                                                <span className="font-medium text-gray-800 dark:text-gray-200">{a.title}</span>
                                                <span className="text-xs text-orange-600 font-mono">{format(new Date(a.dueDate), 'p')}</span>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">{a.subject}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {dayClasses.length > 0 && (
                            <div>
                                <h4 className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-2">{t('classes')}</h4>
                                <div className="space-y-2">
                                    {dayClasses.map(c => (
                                        <div key={c.id} className="flex items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-900/30">
                                            <div className="flex-1">
                                                <span className="font-medium text-gray-800 dark:text-gray-200">{c.subject}</span>
                                                <div className="text-xs text-blue-600">{c.instructor}</div>
                                            </div>
                                            <div className="bg-white dark:bg-blue-900/50 px-2 py-1 rounded text-xs font-mono font-bold text-blue-700 dark:text-blue-300">
                                                {c.time}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {dayTasks.length > 0 && (
                            <div>
                                <h4 className="text-xs font-bold text-green-500 uppercase tracking-wider mb-2">{t('tasks')}</h4>
                                <div className="space-y-2">
                                    {dayTasks.map(taskItem => (
                                        <div key={taskItem.id} className={`flex items-center p-3 rounded-lg border ${taskItem.completed ? 'bg-gray-50 border-gray-200 opacity-60' : 'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-900/30'}`}>
                                            <div className={`h-4 w-4 rounded-full border-2 mr-3 ${taskItem.completed ? 'bg-green-500 border-green-500' : 'list-none border-gray-400'}`}></div>
                                            <span className={`font-medium ${taskItem.completed ? 'line-through text-gray-500' : 'text-gray-800 dark:text-gray-200'}`}>{taskItem.title}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="p-4 max-w-6xl mx-auto animate-fadeIn">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{t('unifiedCalendar')}</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    {renderHeader()}
                    {renderDays()}
                    {renderCells()}
                </div>
                <div className="lg:col-span-1">
                    {renderSelectedDayDetails()}
                </div>
            </div>
        </div>
    );
};

export default CalendarView;
