import React, { useState, useEffect } from 'react';
import { Class, Task, Quiz, Assignment, Note, Priority, SubmissionStatus, AnyItem } from '../types';
import { initialClasses, initialTasks, initialQuizzes, initialAssignments, initialNotes } from '../data';

export const useDataManagement = () => {
    const [classes, setClasses] = useState<Class[]>(initialClasses);
    const [tasks, setTasks] = useState<Task[]>(initialTasks);
    const [quizzes, setQuizzes] = useState<Quiz[]>(initialQuizzes);
    const [assignments, setAssignments] = useState<Assignment[]>(initialAssignments);
    const [notes, setNotes] = useState<Note[]>(initialNotes);
    const [streak, setStreak] = useState<number>(0);
    const [lastStudyDate, setLastStudyDate] = useState<string>('');

    // Load from localStorage on mount
    useEffect(() => {
        const savedClasses = localStorage.getItem('classes');
        if (savedClasses) setClasses(JSON.parse(savedClasses));
        const savedTasks = localStorage.getItem('tasks');
        if (savedTasks) setTasks(JSON.parse(savedTasks));
        const savedQuizzes = localStorage.getItem('quizzes');
        if (savedQuizzes) setQuizzes(JSON.parse(savedQuizzes));
        const savedAssignments = localStorage.getItem('assignments');
        if (savedAssignments) setAssignments(JSON.parse(savedAssignments));
        const savedNotes = localStorage.getItem('notes');
        if (savedNotes) setNotes(JSON.parse(savedNotes));
        const savedStreak = localStorage.getItem('streak');
        if (savedStreak) setStreak(parseInt(savedStreak));
        const savedLastStudyDate = localStorage.getItem('lastStudyDate');
        if (savedLastStudyDate) setLastStudyDate(savedLastStudyDate);
    }, []);

    // Save to localStorage on change
    useEffect(() => {
        try {
            localStorage.setItem('classes', JSON.stringify(classes));
        } catch (error) {
            console.error('Failed to save classes to localStorage:', error);
        }
    }, [classes]);
    useEffect(() => {
        try {
            localStorage.setItem('tasks', JSON.stringify(tasks));
        } catch (error) {
            console.error('Failed to save tasks to localStorage:', error);
        }
    }, [tasks]);
    useEffect(() => {
        try {
            localStorage.setItem('quizzes', JSON.stringify(quizzes));
        } catch (error) {
            console.error('Failed to save quizzes to localStorage:', error);
        }
    }, [quizzes]);
    useEffect(() => {
        try {
            localStorage.setItem('assignments', JSON.stringify(assignments));
        } catch (error) {
            console.error('Failed to save assignments to localStorage:', error);
        }
    }, [assignments]);
    useEffect(() => {
        try {
            localStorage.setItem('notes', JSON.stringify(notes));
        } catch (error) {
            console.error('Failed to save notes to localStorage:', error);
        }
    }, [notes]);
    useEffect(() => {
        try {
            localStorage.setItem('streak', streak.toString());
        } catch (error) {
            console.error('Failed to save streak to localStorage:', error);
        }
    }, [streak]);
    useEffect(() => {
        try {
            localStorage.setItem('lastStudyDate', lastStudyDate);
        } catch (error) {
            console.error('Failed to save lastStudyDate to localStorage:', error);
        }
    }, [lastStudyDate]);

    const handleDelete = (id: string, type: 'schedule' | 'tasks' | 'quizzes' | 'assignments' | 'notes') => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            switch (type) {
                case 'schedule': setClasses(classes.filter(item => item.id !== id)); break;
                case 'tasks': setTasks(tasks.filter(item => item.id !== id)); break;
                case 'quizzes': setQuizzes(quizzes.filter(item => item.id !== id)); break;
                case 'assignments': setAssignments(assignments.filter(item => item.id !== id)); break;
                case 'notes': setNotes(notes.filter(item => item.id !== id)); break;
            }
        }
    };

    const handleSave = (view: 'schedule' | 'tasks' | 'quizzes' | 'assignments' | 'notes', originalItem?: AnyItem, currentItem?: Partial<AnyItem>) => {
        console.log('handleSave called', { view, originalItem, currentItem });
        if (!currentItem) return;

        if (originalItem) { // Update existing item
            const updater = (setter: React.Dispatch<React.SetStateAction<any[]>>) =>
                setter(prev => prev.map(item => item.id === originalItem.id ? { ...item, ...currentItem } : item));

            if (view === 'tasks') updater(setTasks);
            else if (view === 'schedule') updater(setClasses);
            else if (view === 'quizzes') updater(setQuizzes);
            else if (view === 'assignments') updater(setAssignments);
            else if (view === 'notes') updater(setNotes);

        } else { // Add new item
            const newItem = { ...currentItem, id: new Date().toISOString() };
            console.log('Adding new item', newItem);
            if (view === 'tasks') setTasks(prev => [...prev, newItem as Task]);
            else if (view === 'schedule') {
                console.log('Adding class');
                setClasses(prev => [...prev, newItem as Class]);
            }
            else if (view === 'quizzes') setQuizzes(prev => [...prev, newItem as Quiz]);
            else if (view === 'assignments') setAssignments(prev => [...prev, newItem as Assignment]);
            else if (view === 'notes') setNotes(prev => [...prev, { ...newItem, lastUpdated: new Date().toISOString() } as Note]);
        }
    };

    const handleToggleTask = (id: string) => {
        setTasks(tasks.map(task => {
            if (task.id === id) {
                const newCompleted = !task.completed;
                if (newCompleted) {
                    // Update streak when task is completed
                    const today = new Date().toDateString();
                    if (lastStudyDate === today) {
                        // Already studied today
                    } else if (lastStudyDate === new Date(Date.now() - 86400000).toDateString()) {
                        // Yesterday, increment streak
                        setStreak(streak + 1);
                    } else {
                        // Break in streak, reset to 1
                        setStreak(1);
                    }
                    setLastStudyDate(today);
                }
                return { ...task, completed: newCompleted };
            }
            return task;
        }));
    };

    const handleNoteUpdate = (updatedNote: Note) => {
        setNotes(notes.map(note => note.id === updatedNote.id ? { ...updatedNote, lastUpdated: new Date().toISOString() } : note));
    };

    const clearAllData = () => {
        setClasses([]);
        setTasks([]);
        setQuizzes([]);
        setAssignments([]);
        setNotes([]);
        setStreak(0);
        setLastStudyDate('');

        localStorage.removeItem('classes');
        localStorage.removeItem('tasks');
        localStorage.removeItem('quizzes');
        localStorage.removeItem('assignments');
        localStorage.removeItem('notes');
        localStorage.removeItem('streak');
        localStorage.removeItem('lastStudyDate');
    };

    // Notifications for upcoming tasks
    useEffect(() => {
        const checkUpcomingTasks = () => {
            const now = new Date();
            const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
            tasks.forEach(task => {
                if (!task.completed) {
                    const dueDate = new Date(task.dueDate);
                    if (dueDate > now && dueDate <= oneHourLater) {
                        if ('Notification' in window && Notification.permission === 'granted') {
                            new Notification('Upcoming Task', {
                                body: `${task.title} is due soon!`,
                                icon: '/logo.png'
                            });
                        }
                    }
                }
            });
        };

        const interval = setInterval(checkUpcomingTasks, 60 * 1000); // Check every minute
        checkUpcomingTasks(); // Check immediately

        return () => clearInterval(interval);
    }, [tasks]);

    return {
        classes,
        tasks,
        quizzes,
        assignments,
        notes,
        streak,
        handleDelete,
        handleSave,
        handleToggleTask,
        handleNoteUpdate,
        clearAllData
    };
};