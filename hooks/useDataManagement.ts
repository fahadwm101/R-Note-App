import { useState, useEffect } from 'react';
import { 
  doc, 
  onSnapshot, 
  setDoc, 
  updateDoc 
} from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { db, auth } from '../src/lib/firebase';
import { Class, Task, Quiz, Assignment, Note, AnyItem } from '../types';
import { initialClasses, initialTasks, initialQuizzes, initialAssignments, initialNotes } from '../data';

export const useDataManagement = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // States match your data structure
    const [classes, setClasses] = useState<Class[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [notes, setNotes] = useState<Note[]>([]);
    const [streak, setStreak] = useState<number>(0);
    const [lastStudyDate, setLastStudyDate] = useState<string>('');

    // 1. Listen to Authentication & Database
    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            
            if (!currentUser) {
                // Reset data if logged out
                setClasses(initialClasses);
                setTasks(initialTasks);
                setQuizzes(initialQuizzes);
                setAssignments(initialAssignments);
                setNotes(initialNotes);
                setStreak(0);
                setLoading(false);
                return;
            }

            // Listen to this user's document in 'users' collection
            const userDocRef = doc(db, 'users', currentUser.uid);
            
            const unsubscribeSnapshot = onSnapshot(userDocRef, (docSnap) => {
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setClasses(data.classes || []);
                    setTasks(data.tasks || []);
                    setQuizzes(data.quizzes || []);
                    setAssignments(data.assignments || []);
                    setNotes(data.notes || []);
                    setStreak(data.streak || 0);
                    setLastStudyDate(data.lastStudyDate || '');
                } else {
                    // Create initial document for new users with seed data
                    setDoc(userDocRef, {
                        classes: initialClasses,
                        tasks: initialTasks,
                        quizzes: initialQuizzes,
                        assignments: initialAssignments,
                        notes: initialNotes,
                        streak: 0,
                        lastStudyDate: '',
                        createdAt: new Date().toISOString()
                    }, { merge: true });
                }
                setLoading(false);
            }, (error) => {
                console.error("Error syncing data:", error);
                setLoading(false);
            });

            return () => unsubscribeSnapshot();
        });

        return () => unsubscribeAuth();
    }, []);

    // Helper to update Firestore
    const updateFirestore = async (field: string, data: any) => {
        if (!user) return;
        const userDocRef = doc(db, 'users', user.uid);
        try {
            await updateDoc(userDocRef, { [field]: data });
        } catch (error) {
            console.error(`Error updating ${field}:`, error);
        }
    };

    // --- Actions ---

    const handleDelete = async (id: string, type: 'schedule' | 'tasks' | 'quizzes' | 'assignments' | 'notes') => {
        if (!user || !window.confirm('Are you sure you want to delete this item?')) return;

        switch(type) {
            case 'schedule': 
                updateFirestore('classes', classes.filter(item => item.id !== id)); break;
            case 'tasks': 
                updateFirestore('tasks', tasks.filter(item => item.id !== id)); break;
            case 'quizzes': 
                updateFirestore('quizzes', quizzes.filter(item => item.id !== id)); break;
            case 'assignments': 
                updateFirestore('assignments', assignments.filter(item => item.id !== id)); break;
            case 'notes': 
                updateFirestore('notes', notes.filter(item => item.id !== id)); break;
        }
    };

    const handleSave = async (view: 'schedule' | 'tasks' | 'quizzes' | 'assignments' | 'notes', originalItem?: AnyItem, currentItem?: Partial<AnyItem>) => {
        if (!currentItem || !user) return;

        const newItem = originalItem 
            ? { ...originalItem, ...currentItem } 
            : { ...currentItem, id: new Date().toISOString() };

        // Helper function to update array
        const getUpdatedList = (list: any[]) => {
            if (originalItem) {
                return list.map(item => item.id === originalItem.id ? newItem : item);
            }
            return [...list, newItem];
        };

        if (view === 'tasks') updateFirestore('tasks', getUpdatedList(tasks));
        else if (view === 'schedule') updateFirestore('classes', getUpdatedList(classes));
        else if (view === 'quizzes') updateFirestore('quizzes', getUpdatedList(quizzes));
        else if (view === 'assignments') updateFirestore('assignments', getUpdatedList(assignments));
        else if (view === 'notes') {
            const noteItem = { ...newItem, lastUpdated: new Date().toISOString() };
            // Need custom logic for notes because of 'lastUpdated'
            const newNotesList = originalItem 
                ? notes.map(n => n.id === originalItem.id ? noteItem : n)
                : [...notes, noteItem];
            updateFirestore('notes', newNotesList);
        }
    };

    const handleToggleTask = async (id: string) => {
        if (!user) return;

        let newStreak = streak;
        let newLastStudyDate = lastStudyDate;
        let streakUpdated = false;

        const newTasks = tasks.map(task => {
            if (task.id === id) {
                const newCompleted = !task.completed;
                
                // Streak Logic Calculation
                if (newCompleted) {
                    const today = new Date().toDateString();
                    const yesterday = new Date(Date.now() - 86400000).toDateString();

                    if (lastStudyDate !== today) {
                        if (lastStudyDate === yesterday) {
                            newStreak += 1;
                        } else {
                            newStreak = 1;
                        }
                        newLastStudyDate = today;
                        streakUpdated = true;
                    }
                }
                return { ...task, completed: newCompleted };
            }
            return task;
        });

        // Atomic update to Firestore
        const userDocRef = doc(db, 'users', user.uid);
        const updatePayload: any = { tasks: newTasks };
        
        if (streakUpdated) {
            updatePayload.streak = newStreak;
            updatePayload.lastStudyDate = newLastStudyDate;
        }

        try {
            await updateDoc(userDocRef, updatePayload);
        } catch (error) {
            console.error("Error toggling task:", error);
        }
    };

    const handleNoteUpdate = (updatedNote: Note) => {
        const newNotes = notes.map(note => 
            note.id === updatedNote.id 
                ? { ...updatedNote, lastUpdated: new Date().toISOString() } 
                : note
        );
        updateFirestore('notes', newNotes);
    };

    // Notifications (Kept Client-Side as before)
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
                                icon: '/logo.png' // Ensure this path is correct
                            });
                        }
                    }
                }
            });
        };

        const interval = setInterval(checkUpcomingTasks, 60 * 1000);
        checkUpcomingTasks();
        return () => clearInterval(interval);
    }, [tasks]);

    return {
        user,
        loading, // You can use this to show a spinner while data loads
        classes,
        tasks,
        quizzes,
        assignments,
        notes,
        streak,
        handleDelete,
        handleSave,
        handleToggleTask,
        handleNoteUpdate
    };
};