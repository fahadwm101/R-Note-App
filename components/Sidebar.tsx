import React from 'react';
import { View } from '../types';
import { ICONS } from '../constants';
import { useLanguage } from '../LanguageContext';
import { useAuth } from '../src/context/AuthContext';

interface SidebarProps {
    currentView: View;
    setView: (view: View) => void;
    isOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, isOpen }) => {
    const { t, language } = useLanguage();
    const { user } = useAuth();
    const [avatar, setAvatar] = React.useState<string>(user?.photoURL || '/logo.png');
    const [studentName, setStudentName] = React.useState<string>(user?.displayName || 'Student');

    React.useEffect(() => {
        if (user?.photoURL) setAvatar(user.photoURL);
        if (user?.displayName) setStudentName(user.displayName);
        const savedAvatar = localStorage.getItem('avatar');
        if (savedAvatar && !user?.photoURL) setAvatar(savedAvatar);
        const savedName = localStorage.getItem('studentName');
        if (savedName && !user?.displayName) setStudentName(savedName);
    }, [user]);
    
    const navItems: { id: View; name: string; icon: React.ReactNode }[] = [
        { id: 'dashboard', name: t('dashboard'), icon: ICONS.dashboard },
        { id: 'schedule', name: t('classSchedule'), icon: ICONS.schedule },
        { id: 'tasks', name: t('tasks'), icon: ICONS.tasks },
        { id: 'quizzes', name: t('quizzes'), icon: ICONS.quizzes },
        { id: 'assignments', name: t('assignments'), icon: ICONS.assignments },
        { id: 'notes', name: t('notes'), icon: ICONS.notes },
        { id: 'pomodoro', name: 'Pomodoro', icon: ICONS.tasks }, // Use tasks icon for now
        { id: 'profile', name: t('profileSettings'), icon: ICONS.profile },
    ];

    const baseClasses = "flex flex-col bg-black/30 backdrop-blur-xl shadow-lg h-full transition-transform duration-300 ease-in-out z-40 w-64";

    // Positioning based on language
    const isRTL = language === 'ar';
    const positionClasses = isRTL ? 'right-0' : 'left-0';
    const transformClasses = isOpen
        ? 'translate-x-0'
        : isRTL ? 'translate-x-full' : '-translate-x-full';

    return (
        <aside className={`${baseClasses} fixed inset-y-0 ${positionClasses} lg:relative lg:inset-y-auto lg:!transform-none ${transformClasses} flex flex-col justify-center`}>
            {/* Student Info Header */}
            <div className="pb-4 px-4">
                <div className="flex flex-col items-center">
                    <img src={avatar} alt="Student Avatar" className="h-12 w-12 rounded-full object-contain mb-2" />
                    <div className="text-center">
                        <p className="text-white font-semibold">{studentName}</p>
                    </div>
                </div>
            </div>
            <nav className="px-2 py-4 space-y-1">
                {navItems.map((item) => (
                    <a
                        key={item.id}
                        href="#"
                        onClick={(e) => {
                            e.preventDefault();
                            setView(item.id);
                        }}
                        className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                            currentView === item.id
                                ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300'
                                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                    >
                        {item.icon}
                        <span className="ms-3">{item.name}</span>
                    </a>
                ))}
            </nav>
        </aside>
    );
};

export default Sidebar;