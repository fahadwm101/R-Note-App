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
    const [imageError, setImageError] = React.useState<boolean>(false);

    React.useEffect(() => {
        if (user?.photoURL) {
            setAvatar(user.photoURL);
            setImageError(false);
        }
        if (user?.displayName) setStudentName(user.displayName);
        const savedAvatar = localStorage.getItem('avatar');
        if (savedAvatar && !user?.photoURL) {
            setAvatar(savedAvatar);
            setImageError(false);
        }
        const savedName = localStorage.getItem('studentName');
        if (savedName && !user?.displayName) setStudentName(savedName);
    }, [user]);

    const navItems = [
        { id: 'dashboard', name: t('dashboard'), icon: ICONS.dashboard },
        { id: 'schedule', name: t('classSchedule'), icon: ICONS.schedule },
        { id: 'tasks', name: t('tasks'), icon: ICONS.tasks },
        { id: 'quizzes', name: t('quizzes'), icon: ICONS.quizzes },
        { id: 'assignments', name: t('assignments'), icon: ICONS.assignments },
        { id: 'notes', name: t('notes'), icon: ICONS.notes },
        { id: 'pomodoro', name: 'Pomodoro', icon: ICONS.tasks }, // Use tasks icon for now
        { id: 'profile', name: t('profileSettings'), icon: ICONS.profile },
    ];

    const baseClasses = "flex flex-col bg-white/60 dark:bg-black/30 backdrop-blur-xl shadow-lg h-full transition-transform duration-300 ease-in-out z-40 w-64";

    // Positioning based on language
    const isRTL = language === 'ar';
    const positionClasses = isRTL ? 'right-0' : 'left-0';
    const transformClasses = isOpen
        ? 'translate-x-0'
        : isRTL ? 'translate-x-full' : '-translate-x-full';

    return (
        <aside className={`${baseClasses} fixed inset-y-0 ${positionClasses} lg:relative lg:inset-y-auto lg:!transform-none ${transformClasses} flex flex-col`}>
            {/* Student Info Header */}
            <div className="pt-32 pb-4 px-4 bg-gradient-to-b from-white/20 dark:from-black/20 to-transparent">
                <div className="flex flex-col items-center">
                    {(!avatar || imageError) ? (
                        <div className="h-16 w-16 rounded-full bg-slate-200 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 flex items-center justify-center mb-3 shadow-lg">
                            <span className="text-2xl text-slate-500 dark:text-slate-400">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                </svg>
                            </span>
                        </div>
                    ) : (
                        <img
                            src={avatar}
                            alt="Student Avatar"
                            className="h-16 w-16 rounded-full object-cover border-2 border-white/50 dark:border-white/20 mb-3 shadow-lg"
                            onError={() => setImageError(true)}
                        />
                    )}
                    <div className="text-center">
                        <p className="text-gray-900 dark:text-white font-bold text-lg tracking-wide">{studentName}</p>
                        <p className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider font-medium">Student</p>
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
                        className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${currentView === item.id
                            ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300'
                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                    >
                        {item.icon}
                        <span className="ms-3">{item.name}</span>
                    </a>
                ))}
            </nav>
            <div className="mt-auto py-4 text-center">
                <p className="text-xs text-gray-500">v1.0.1 (Beta)</p>
            </div>
        </aside>
    );
};

export default Sidebar;