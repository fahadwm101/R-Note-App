
import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ClassSchedule from './components/ClassSchedule';
import Tasks from './components/Tasks';
import Quizzes from './components/Quizzes';
import Assignments from './components/Assignments';
import Notes from './components/Notes';
import ProfileSettings from './components/ProfileSettings';
import Pomodoro from './components/Pomodoro';
import SmartAssistant from './components/SmartAssistant';
import Modal from './components/Modal';
import FormField from './components/FormField';
import Login from './src/components/Login';
import { View, ModalContent, AnyItem, Class, Task, Quiz, Assignment, Note, Priority } from './types';
import { useLanguage } from './LanguageContext';
import { useDataManagement } from './hooks/useDataManagement';
import { AuthProvider, useAuth } from './src/context/AuthContext';

const App: React.FC = () => {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
};

const AppContent: React.FC = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-950 text-white">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                    <p>Loading...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return <Login />;
    }

    const [currentView, setCurrentView] = useState<View>('dashboard');
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const { t } = useLanguage();

    const { classes, tasks, quizzes, assignments, notes, streak, handleDelete, handleSave: saveData, handleToggleTask, handleNoteUpdate } = useDataManagement();

    // Mouse Tracking Logic
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const springConfig = { damping: 25, stiffness: 120 };

    // Move blobs based on mouse position (Parallax effect)
    // Blob 1 (Orange) - Moves opposite to mouse, moderate speed
    const x1 = useSpring(useTransform(mouseX, [0, window.innerWidth], [50, -50]), springConfig);
    const y1 = useSpring(useTransform(mouseY, [0, window.innerHeight], [50, -50]), springConfig);

    // Blob 2 (Purple) - Moves with mouse, slow speed
    const x2 = useSpring(useTransform(mouseX, [0, window.innerWidth], [-30, 30]), springConfig);
    const y2 = useSpring(useTransform(mouseY, [0, window.innerHeight], [-30, 30]), springConfig);

    // Blob 3 (Indigo) - Moves opposite, slow speed
    const x3 = useSpring(useTransform(mouseX, [0, window.innerWidth], [20, -20]), springConfig);
    const y3 = useSpring(useTransform(mouseY, [0, window.innerHeight], [20, -20]), springConfig);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            mouseX.set(e.clientX);
            mouseY.set(e.clientY);
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [mouseX, mouseY]);

    // Modal State
    const [modalContent, setModalContent] = useState<ModalContent>(null);
    const [currentItem, setCurrentItem] = useState<Partial<AnyItem> | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        document.documentElement.classList.add('dark');
        // Request notification permission
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, []);

    const handleSave = () => {
        if (!modalContent || !currentItem) return;

        setIsSaving(true);
        try {
            const { view, item: originalItem } = modalContent;
            saveData(view, originalItem, currentItem);
            closeModal();
        } catch (error) {
            console.error('Failed to save item:', error);
        } finally {
            setIsSaving(false);
        }
    };


    // --- Modal Logic ---
    const openModal = (view: ModalContent['view'], item?: AnyItem) => {
        setModalContent({ view, item });
        setCurrentItem(item || (view === 'notes' ? { title: '', subject: '', content: '' } : {}));
    };

    const closeModal = () => {
        setModalContent(null);
        setCurrentItem(null);
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setCurrentItem(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const renderModalContent = () => {
        if (!modalContent || !currentItem) return null;

        const commonFields = <FormField label={t('subject')} name="subject" type="text" value={(currentItem as any).subject || ''} onChange={handleFormChange} required />;

        switch (modalContent.view) {
            case 'tasks':
                return (
                    <div>
                        <FormField label={t('title')} name="title" type="text" value={(currentItem as Task).title || ''} onChange={handleFormChange} required />
                        <FormField label={t('dueDate')} name="dueDate" type="date" value={(currentItem as Task).dueDate || ''} onChange={handleFormChange} />
                        <FormField label={t('priority')} name="priority" type="select" value={(currentItem as Task).priority || Priority.Medium} onChange={handleFormChange} options={Object.values(Priority).map(p => ({ value: p, label: p }))} />
                    </div>
                );
            case 'notes':
                return (
                    <div>
                        {commonFields}
                        <FormField label={t('title')} name="title" type="text" value={(currentItem as Note).title || ''} onChange={handleFormChange} required />
                        <FormField label={t('content')} name="content" type="textarea" value={(currentItem as Note).content || ''} onChange={handleFormChange} rows={5} />
                    </div>
                );
            case 'schedule':
                return (
                    <div>
                        <FormField label={t('subject')} name="subject" type="text" value={(currentItem as Class).subject || ''} onChange={handleFormChange} required />
                        <FormField label={t('time')} name="time" type="text" value={(currentItem as Class).time || ''} onChange={handleFormChange} placeholder="e.g., 10:00 - 11:30" required />
                        <FormField label={t('day')} name="day" type="select" value={(currentItem as Class).day || 'Monday'} onChange={handleFormChange} options={['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => ({ value: day, label: t(day.toLowerCase()) }))} />
                        <FormField label={t('instructor')} name="instructor" type="text" value={(currentItem as Class).instructor || ''} onChange={handleFormChange} required />
                        <FormField label={t('color')} name="color" type="select" value={(currentItem as Class).color || 'bg-blue-500'} onChange={handleFormChange} options={[
                            { value: 'bg-red-500', label: t('red') },
                            { value: 'bg-blue-500', label: t('blue') },
                            { value: 'bg-green-500', label: t('green') },
                            { value: 'bg-yellow-500', label: t('yellow') },
                            { value: 'bg-purple-500', label: t('purple') },
                            { value: 'bg-pink-500', label: t('pink') }
                        ]} />
                    </div>
                );
            case 'quizzes':
                return (
                    <div>
                        <FormField label={t('subject')} name="subject" type="text" value={(currentItem as Quiz).subject || ''} onChange={handleFormChange} required />
                        <FormField label={t('date')} name="date" type="date" value={(currentItem as Quiz).date || ''} onChange={handleFormChange} required />
                        <FormField label={t('studyMaterialsUrl')} name="materialsUrl" type="url" value={(currentItem as Quiz).materialsUrl || ''} onChange={handleFormChange} />
                    </div>
                );
            case 'assignments':
                return (
                    <div>
                        <FormField label={t('subject')} name="subject" type="text" value={(currentItem as Assignment).subject || ''} onChange={handleFormChange} required />
                        <FormField label={t('title')} name="title" type="text" value={(currentItem as Assignment).title || ''} onChange={handleFormChange} required />
                        <FormField label={t('description')} name="description" type="textarea" value={(currentItem as Assignment).description || ''} onChange={handleFormChange} rows={3} required />
                        <FormField label={t('dueDate')} name="dueDate" type="datetime-local" value={(currentItem as Assignment).dueDate || ''} onChange={handleFormChange} required />
                    </div>
                );
            default:
                return <div>Form not implemented yet.</div>
        }
    }


    const renderView = () => {
        switch (currentView) {
            case 'dashboard':
                return <Dashboard tasks={tasks} quizzes={quizzes} notes={notes} streak={streak} openModal={openModal} />;
            case 'schedule':
                return <ClassSchedule classes={classes} onDelete={(id) => handleDelete(id, 'schedule')} onEdit={(item) => openModal('schedule', item)} />;
            case 'tasks':
                return <Tasks tasks={tasks} onToggleComplete={handleToggleTask} onDelete={(id) => handleDelete(id, 'tasks')} onEdit={(item) => openModal('tasks', item)} />;
            case 'quizzes':
                return <Quizzes quizzes={quizzes} onDelete={(id) => handleDelete(id, 'quizzes')} onEdit={(item) => openModal('quizzes', item)} />;
            case 'assignments':
                return <Assignments assignments={assignments} onDelete={(id) => handleDelete(id, 'assignments')} onEdit={(item) => openModal('assignments', item)} />;
            case 'notes':
                return <Notes notes={notes} onAdd={() => openModal('notes')} onUpdate={handleNoteUpdate} onDelete={(id) => handleDelete(id, 'notes')} />;
            case 'pomodoro':
                return <Pomodoro />;
            case 'profile':
                return <ProfileSettings />;
            default:
                return <Dashboard tasks={tasks} quizzes={quizzes} notes={notes} openModal={openModal} />;
        }
    };

    const handleSetView = (view: View) => {
        setCurrentView(view);
        if (window.innerWidth < 1024) {
            setSidebarOpen(false);
        }
    };

    return (
        <div className="flex h-screen text-gray-900 dark:text-gray-100 relative overflow-hidden bg-slate-950">
            {/* 🌊 Organic Liquid Background */}
            <div className="absolute inset-0 w-full h-full pointer-events-none">

                {/* Blob 1: The Sunset (Orange) - Swimming Diagonally */}
                <motion.div
                    style={{ x: x1, y: y1 }}
                    className="absolute top-[-10%] left-[-10%] w-[80vw] h-[80vw]
                     bg-orange-500/30 mix-blend-screen blur-[100px] opacity-40
                     animate-first rounded-[40%_60%_70%_30%/40%_50%_60%_50%]">
                </motion.div>

                {/* Blob 2: The Twilight (Purple) - Rotating & Morphing */}
                <motion.div
                    style={{ x: x2, y: y2 }}
                    className="absolute top-[20%] right-[-20%] w-[70vw] h-[70vw]
                     bg-purple-600/30 mix-blend-screen blur-[100px] opacity-40
                     animate-second rounded-[30%_70%_70%_30%/30%_30%_70%_70%]">
                </motion.div>

                {/* Blob 3: The Deep Sea (Indigo) - Floating Up/Down */}
                <motion.div
                    style={{ x: x3, y: y3 }}
                    className="absolute bottom-[-20%] left-[20%] w-[60vw] h-[60vw]
                     bg-indigo-600/30 mix-blend-screen blur-[120px] opacity-40
                     animate-third rounded-[80%_20%_30%_70%/60%_40%_60%_40%]">
                </motion.div>

            </div>

            <div className="relative z-10 flex w-full">
                <Sidebar currentView={currentView} setView={handleSetView} isOpen={isSidebarOpen} />
                <div className="flex-1 flex flex-col overflow-hidden">
                    <Header toggleSidebar={() => setSidebarOpen(!isSidebarOpen)} />
                    <main className="flex-1 overflow-x-hidden overflow-y-auto m-2 sm:m-4">
                        {renderView()}
                    </main>
                </div>
                {isSidebarOpen && <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black opacity-50 z-30 lg:hidden"></div>}
                <SmartAssistant />
            </div>

            <Modal isOpen={!!modalContent} onClose={closeModal} title={modalContent?.item ? t('editItem') : t('addNewItem')}>
                {renderModalContent()}
                <div className="mt-6 flex justify-end space-x-3">
                    <button onClick={closeModal} type="button" className="bg-white/60 dark:bg-gray-700/60 py-2 px-4 border border-gray-300/70 dark:border-gray-600/70 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50/60 dark:hover:bg-gray-600/60">
                        {t('cancel')}
                    </button>
                    <button onClick={handleSave} type="button" disabled={isSaving} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600/80 hover:bg-indigo-700/80 disabled:opacity-50">
                        {isSaving ? 'Saving...' : t('save')}
                    </button>
                </div>
            </Modal>
        </div>
    );
};

export default App;
