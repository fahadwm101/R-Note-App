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

            <div className="max-w-md mx-auto bg-slate-900/60 backdrop-blur-xl border border-white/10 shadow-2xl rounded-[32px] p-8">
                <form>
                    {/* Profile Picture */}
                    <div className="mb-6 text-center">
                        {(!avatar || imageError) ? (
                            <div className="h-24 w-24 rounded-full bg-slate-800 border-2 border-slate-600 flex items-center justify-center mx-auto mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                </svg>
                            </div>
                        ) : (
                            <img
                                src={avatar}
                                alt="Profile Picture"
                                className="h-24 w-24 rounded-full object-cover border-2 border-indigo-500 mx-auto mb-4 shadow-[0_0_20px_rgba(99,102,241,0.6)] transition-all hover:shadow-[0_0_30px_rgba(99,102,241,0.8)]"
                                onError={() => setImageError(true)}
                            />
                        )}
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="displayName">
                            Display Name
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-500 bg-slate-800 border-gray-300 dark:border-gray-600 leading-tight cursor-not-allowed"
                            id="displayName"
                            type="text"
                            value={studentName}
                            disabled
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="username">
                            Email Address
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-500 bg-slate-800 border-gray-300 dark:border-gray-600 leading-tight cursor-not-allowed"
                            id="username"
                            type="email"
                            value={user?.email || 'student@university.edu'}
                            disabled
                        />
                    </div>
                </form>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mb-6">
                    <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">App Preferences</h2>
                    <div className="space-y-6">
                        <div className="flex items-center justify-between py-2">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Theme</span>
                            <button
                                onClick={toggleTheme}
                                className="p-2 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-yellow-300 transition-colors"
                            >
                                {theme === 'dark' ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                        <div className="flex items-center justify-between py-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Notifications</label>
                            <input type="checkbox" className="form-checkbox h-5 w-5 text-indigo-600 bg-slate-700 border-slate-600 rounded focus:ring-indigo-500" id="emailNotif" />
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mb-6">
                    <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">Data Management</h2>
                    <div className="space-y-4">
                        <button
                            onClick={() => {
                                if (window.confirm('Are you sure you want to delete ALL data? This action cannot be undone.')) {
                                    clearAllData();
                                    alert('All data has been deleted.');
                                }
                            }}
                            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded w-full sm:w-auto"
                        >
                            Delete All Data
                        </button>
                    </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                    <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">Account</h2>
                    <button onClick={logOut} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                        Sign Out
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProfileSettings;
