import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../LanguageContext';

const Pomodoro: React.FC = () => {
    const { t } = useLanguage();
    const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
    const [isActive, setIsActive] = useState(false);
    const [isBreak, setIsBreak] = useState(false);
    const [sessions, setSessions] = useState(0);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const clickSoundRef = useRef<HTMLAudioElement | null>(null);
    const alarmSoundRef = useRef<HTMLAudioElement | null>(null);

    // Initialize audio refs
    useEffect(() => {
        clickSoundRef.current = new Audio('/sounds/click.mp3');
        alarmSoundRef.current = new Audio('/sounds/alarm.mp3');
    }, []);

    // Play click sound
    const playClickSound = () => {
        if (clickSoundRef.current) {
            clickSoundRef.current.currentTime = 0;
            clickSoundRef.current.play().catch(err => console.error('Error playing click sound:', err));
        }
    };

    // Play alarm sound
    const playAlarmSound = () => {
        if (alarmSoundRef.current) {
            alarmSoundRef.current.currentTime = 0;
            alarmSoundRef.current.play().catch(err => console.error('Error playing alarm sound:', err));
        }
    };

    useEffect(() => {
        if (isActive && timeLeft > 0) {
            intervalRef.current = setInterval(() => {
                setTimeLeft(time => time - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            playAlarmSound(); // Play alarm when timer finishes
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
                setIsActive(false);
                if ('Notification' in window && Notification.permission === 'granted') {
                    new Notification(t('workTimeNotification'), { body: t('backToWork') });
                }
            }
        } else {
            if (intervalRef.current) clearInterval(intervalRef.current);
        }

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isActive, timeLeft, isBreak]);

    const toggleTimer = () => {
        playClickSound();
        setIsActive(!isActive);
    };

    const resetTimer = () => {
        playClickSound();
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
            <div className="max-w-md mx-auto bg-slate-900/60 backdrop-blur-xl border border-white/10 shadow-2xl rounded-[32px] p-8 text-center">
                <div className="mb-6">
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">{t('focusTask')}</label>
                    <input type="text" placeholder={t('whatAreYouWorkingOn')} className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg text-black dark:text-white bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div className="relative mb-6">
                    <svg className="w-56 h-56 mx-auto" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="45" stroke="rgba(255,255,255,0.1)" strokeWidth="6" fill="none" />
                        <circle cx="50" cy="50" r="45" stroke="rgb(99,102,241)" strokeWidth="6" fill="none" strokeDasharray={`${progress * 283} 283`} strokeLinecap="round" className="shadow-[0_0_20px_rgba(99,102,241,0.6)]" transform="rotate(-90 50 50)" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-7xl font-mono text-white font-bold">{formatTime(timeLeft)}</div>
                </div>
                <div className="text-xl mb-4 text-gray-700 dark:text-gray-300 font-semibold">{isBreak ? t('breakTime') : t('workTime')}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-8 flex items-center justify-center space-x-2">
                    {Array.from({length: sessions}, (_, i) => <span key={i} className="text-2xl">🍅</span>)}
                    <span className="ml-2">{t('sessionsCompleted')}</span>
                </div>

                <div className="flex justify-center space-x-6">
                    <button
                        onClick={toggleTimer}
                        className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold py-3 px-8 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                        {isActive ? t('pause') : t('start')}
                    </button>
                    <button
                        onClick={resetTimer}
                        className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-bold py-3 px-8 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                        {t('reset')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Pomodoro;