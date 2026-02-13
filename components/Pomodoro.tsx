import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../LanguageContext';

const Pomodoro: React.FC = () => {
    const { t } = useLanguage();
    const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
    const [isActive, setIsActive] = useState(false);
    const [isBreak, setIsBreak] = useState(false);
    const [sessions, setSessions] = useState(0);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (isActive && timeLeft > 0) {
            intervalRef.current = setInterval(() => {
                setTimeLeft(time => time - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            if (!isBreak) {
                setIsBreak(true);
                setTimeLeft(10 * 60); // 10 minute break
                setSessions(s => s + 1);
                if ('Notification' in window && Notification.permission === 'granted') {
                    new Notification(t('breakTimeNotification'), { body: t('takeTenMinuteBreak') });
                }
            } else {
                setIsBreak(false);
                setTimeLeft(25 * 60); // Back to work
                // Auto loop - don't stop the timer
            }
        } else {
            if (intervalRef.current) clearInterval(intervalRef.current);
        }

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isActive, timeLeft, isBreak]);

    const toggleTimer = () => {
        setIsActive(!isActive);
    };

    const resetTimer = () => {
        setIsActive(false);
        setIsBreak(false);
        setTimeLeft(25 * 60);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const totalTime = isBreak ? 10 * 60 : 25 * 60;
    const progress = (totalTime - timeLeft) / totalTime;

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">{t('pomodoroTimer')}</h1>
            <div className="max-w-md mx-auto bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-2xl rounded-[32px] p-8 text-center transition-colors duration-300">
                <div className="mb-6">
                    <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-2">{t('focusTask')}</label>
                    <input type="text" placeholder={t('whatAreYouWorkingOn')} className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
                </div>
                <div className="relative mb-8">
                    <svg className="w-64 h-64 mx-auto" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="5" fill="none" className="text-slate-100 dark:text-white/5" />
                        <circle cx="50" cy="50" r="45" stroke="rgb(99,102,241)" strokeWidth="5" fill="none" strokeDasharray={`${progress * 283} 283`} strokeLinecap="round" className="shadow-[0_0_15px_rgba(99,102,241,0.5)] transition-all duration-1000 ease-linear" transform="rotate(-90 50 50)" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-6xl font-mono font-bold text-slate-800 dark:text-white tracking-tighter">{formatTime(timeLeft)}</span>
                        <span className="text-sm font-medium text-slate-500 dark:text-gray-400 mt-2 uppercase tracking-widest">{isBreak ? t('breakTime') : t('workTime')}</span>
                    </div>
                </div>
                <div className="text-sm text-slate-600 dark:text-gray-400 mb-8 flex items-center justify-center space-x-2 bg-slate-50 dark:bg-white/5 py-2 px-4 rounded-full inline-flex">
                    <span className="flex">{Array.from({ length: sessions }, (_, i) => <span key={i} className="text-lg">🍅</span>)}</span>
                    <span className="font-medium">{sessions} {sessions === 1 ? 'Session' : 'Sessions'}</span>
                </div>

                <div className="flex justify-center space-x-4">
                    <button
                        onClick={toggleTimer}
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-4 px-10 rounded-2xl shadow-lg shadow-indigo-500/30 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                        {isActive ? t('pause') : t('start')}
                    </button>
                    <button
                        onClick={resetTimer}
                        className="bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-white font-bold py-4 px-6 rounded-2xl shadow-sm transition-all duration-300"
                    >
                        {t('reset')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Pomodoro;
