import React from 'react';
import { useLanguage } from '../LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../src/context/AuthContext';

import { Task, Class, Note, Assignment, Quiz } from '../types';

interface ProfileSettingsProps {
    tasks: Task[];
    classes: Class[];
    notes: Note[];
    assignments: Assignment[];
    quizzes: Quiz[];
    clearAllData: () => void;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ tasks, classes, notes, assignments, quizzes, clearAllData }) => {
    const { t } = useLanguage();
    const { theme, toggleTheme } = useTheme();
    // Removed local useDataManagement hook call to avoid state desync
    const { logOut, user } = useAuth();
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

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                const result = reader.result as string;
                setAvatar(result);
                setImageError(false);
                localStorage.setItem('avatar', result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const name = e.target.value;
        setStudentName(name);
        localStorage.setItem('studentName', name);
    };

    const exportData = () => {
        const data = { tasks, classes, notes, assignments, quizzes };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'rnote-data.json';
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">{t('profileSettings')}</h1>

            <div className="max-w-md mx-auto bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-2xl rounded-[32px] p-8 transition-colors duration-300">
                <form>
                    {/* Profile Picture */}
                    <div className="mb-8 text-center">
                        {(!avatar || imageError) ? (
                            <div className="h-28 w-28 rounded-full bg-slate-100 dark:bg-slate-800 border-4 border-white dark:border-slate-700 flex items-center justify-center mx-auto mb-4 shadow-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                </svg>
                            </div>
                        ) : (
                            <div className="relative inline-block">
                                <img
                                    src={avatar}
                                    alt="Profile Picture"
                                    className="h-28 w-28 rounded-full object-cover border-4 border-white dark:border-slate-700 mx-auto shadow-lg transition-transform hover:scale-105"
                                    onError={() => setImageError(true)}
                                />
                                <div className="absolute bottom-1 right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-white dark:border-slate-800"></div>
                            </div>
                        )}
                        <h2 className="mt-4 text-xl font-bold text-slate-800 dark:text-white">{studentName}</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{user?.email || 'Student Account'}</p>
                    </div>

                    <div className="space-y-5">
                        <div>
                            <label className="block text-slate-700 dark:text-gray-300 text-sm font-bold mb-2 ml-1" htmlFor="displayName">
                                {t('displayName') || 'Display Name'}
                            </label>
                            <input
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-gray-400 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-not-allowed opacity-75"
                                id="displayName"
                                type="text"
                                value={studentName}
                                disabled
                            />
                        </div>
                        <div>
                            <label className="block text-slate-700 dark:text-gray-300 text-sm font-bold mb-2 ml-1" htmlFor="username">
                                {t('emailAddress') || 'Email Address'}
                            </label>
                            <input
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-gray-400 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-not-allowed opacity-75"
                                id="username"
                                type="email"
                                value={user?.email || 'student@university.edu'}
                                disabled
                            />
                        </div>
                    </div>
                </form>

                <div className="border-t border-slate-100 dark:border-white/10 pt-6 mt-8 mb-6">
                    <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">{t('appPreferences') || 'App Preferences'}</h2>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-white/5 rounded-xl">
                            <span className="text-sm font-medium text-slate-700 dark:text-gray-300 flex items-center gap-2">
                                <span>{theme === 'dark' ? '🌙' : '☀️'}</span>
                                {t('theme') || 'Theme'}
                            </span>
                            <button
                                onClick={toggleTheme}
                                className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'bg-slate-700 text-yellow-300' : 'bg-white text-orange-500 shadow-sm border border-slate-200'}`}
                            >
                                {theme === 'dark' ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-white/5 rounded-xl">
                            <label className="text-sm font-medium text-slate-700 dark:text-gray-300 flex items-center gap-2">
                                <span>🔔</span>
                                {t('emailNotifications') || 'Email Notifications'}
                            </label>
                            <div className="relative inline-block w-10 mr-2 align-middle select-none">
                                <input type="checkbox" name="toggle" id="emailNotif" className="checked:bg-indigo-500 outline-none focus:outline-none right-4 checked:right-0 duration-200 ease-in absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer border-slate-300 checked:border-indigo-500" />
                                <label htmlFor="emailNotif" className="block overflow-hidden h-6 rounded-full bg-slate-300 cursor-pointer"></label>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-slate-100 dark:border-white/10 pt-6 mb-6">
                    <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">{t('dataManagement') || 'Data Management'}</h2>
                    <div className="space-y-4">
                        <button
                            onClick={() => {
                                if (window.confirm('Are you sure you want to delete ALL data? This action cannot be undone.')) {
                                    clearAllData();
                                    alert('All data has been deleted.');
                                }
                            }}
                            className="w-full bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 font-bold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 border border-red-100 dark:border-red-900/30"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            {t('deleteAllData') || 'Delete All Data'}
                        </button>
                    </div>
                </div>

                <div className="border-t border-slate-100 dark:border-white/10 pt-6">
                    <button onClick={logOut} className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-700 dark:text-white font-bold py-3 px-4 rounded-xl transition-colors">
                        {t('signOut') || 'Sign Out'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProfileSettings;
