
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useLanguage } from '../LanguageContext';
import { sendNotification } from '../src/utils/notifications';

interface PomodoroContextType {
    workMin: number;
    breakMin: number;
    timeLeft: number;
    isActive: boolean;
    isBreak: boolean;
    sessions: number;
    setWorkMin: (val: number) => void;
    setBreakMin: (val: number) => void;
    toggleTimer: () => void;
    resetTimer: () => void;
}

const PomodoroContext = createContext<PomodoroContextType | undefined>(undefined);

export const PomodoroProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { t } = useLanguage();

    const [workMin, setWorkMinState] = useState(() => Number(localStorage.getItem('pomodoroWork')) || 25);
    const [breakMin, setBreakMinState] = useState(() => Number(localStorage.getItem('pomodoroBreak')) || 10);

    const [timeLeft, setTimeLeft] = useState(() => {
        const saved = localStorage.getItem('pomodoroTimeLeft');
        return saved !== null ? Number(saved) : workMin * 60;
    });
    const [isActive, setIsActive] = useState(() => localStorage.getItem('pomodoroIsActive') === 'true');
    const [isBreak, setIsBreak] = useState(() => localStorage.getItem('pomodoroIsBreak') === 'true');
    const [sessions, setSessions] = useState(() => Number(localStorage.getItem('pomodoroSessions')) || 0);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const setWorkMin = (val: number) => {
        setWorkMinState(val);
        localStorage.setItem('pomodoroWork', String(val));
        if (!isActive && !isBreak) setTimeLeft(val * 60);
    };

    const setBreakMin = (val: number) => {
        setBreakMinState(val);
        localStorage.setItem('pomodoroBreak', String(val));
        if (!isActive && isBreak) setTimeLeft(val * 60);
    };

    // Initial persistence sync on mount
    useEffect(() => {
        const savedIsActive = localStorage.getItem('pomodoroIsActive') === 'true';
        if (savedIsActive) {
            const lastTimestamp = Number(localStorage.getItem('pomodoroLastTimestamp'));
            if (lastTimestamp) {
                const now = Date.now();
                const elapsedSeconds = Math.floor((now - lastTimestamp) / 1000);
                const savedTimeLeft = Number(localStorage.getItem('pomodoroTimeLeft'));
                const newTimeLeft = Math.max(0, savedTimeLeft - elapsedSeconds);

                setTimeLeft(newTimeLeft);

                if (newTimeLeft === 0) {
                    setIsActive(false);
                }
            }
        }
    }, []);

    // Sync state to localStorage
    useEffect(() => {
        localStorage.setItem('pomodoroTimeLeft', String(timeLeft));
        localStorage.setItem('pomodoroIsActive', String(isActive));
        localStorage.setItem('pomodoroIsBreak', String(isBreak));
        localStorage.setItem('pomodoroSessions', String(sessions));
        if (isActive) {
            localStorage.setItem('pomodoroLastTimestamp', String(Date.now()));
        }
    }, [timeLeft, isActive, isBreak, sessions]);

    useEffect(() => {
        if (isActive && timeLeft > 0) {
            intervalRef.current = setInterval(() => {
                setTimeLeft(time => {
                    if (time <= 1) {
                        // We reached transition
                        return 0;
                    }
                    return time - 1;
                });
            }, 1000);
        } else {
            if (intervalRef.current) clearInterval(intervalRef.current);
        }

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isActive, workMin, breakMin]);

    // Handle session transitions separately
    useEffect(() => {
        if (timeLeft === 0 && isActive) {
            if (!isBreak) {
                setIsBreak(true);
                const nextTime = breakMin * 60;
                setTimeLeft(nextTime);
                setSessions(s => s + 1);
                sendNotification(t('breakTimeNotification'), { body: t('takeTenMinuteBreak') || `Take a ${breakMin} minute break.` });
            } else {
                setIsBreak(false);
                const nextTime = workMin * 60;
                setTimeLeft(nextTime);
                sendNotification(t('workTimeNotification'), { body: t('backToWork') });
            }
        }
    }, [timeLeft, isActive, isBreak, breakMin, workMin, t]);

    const toggleTimer = () => {
        const newActive = !isActive;
        setIsActive(newActive);
        if (newActive) {
            localStorage.setItem('pomodoroLastTimestamp', String(Date.now()));
        }
    };

    const resetTimer = () => {
        setIsActive(false);
        setIsBreak(false);
        const resetTime = workMin * 60;
        setTimeLeft(resetTime);
        localStorage.removeItem('pomodoroLastTimestamp');
        localStorage.setItem('pomodoroTimeLeft', String(resetTime));
        localStorage.setItem('pomodoroIsActive', 'false');
        localStorage.setItem('pomodoroIsBreak', 'false');
    };

    return (
        <PomodoroContext.Provider value={{
            workMin, breakMin, timeLeft, isActive, isBreak, sessions,
            setWorkMin, setBreakMin, toggleTimer, resetTimer
        }}>
            {children}
        </PomodoroContext.Provider>
    );
};

export const usePomodoro = () => {
    const context = useContext(PomodoroContext);
    if (!context) {
        throw new Error('usePomodoro must be used within a PomodoroProvider');
    }
    return context;
};
