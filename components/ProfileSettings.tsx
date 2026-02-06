import React from 'react';
import { useLanguage } from '../LanguageContext';
import { useDataManagement } from '../hooks/useDataManagement';
import { useAuth } from '../src/context/AuthContext';

interface ProfileSettingsProps {}

const ProfileSettings: React.FC<ProfileSettingsProps> = () => {
    const { t } = useLanguage();
    const { tasks, classes, notes, assignments, quizzes } = useDataManagement();
    const { logOut, user } = useAuth();
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

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                const result = reader.result as string;
                setAvatar(result);
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
                        <img src={avatar} alt="Profile Picture" className="h-20 w-20 rounded-full object-contain mx-auto mb-4" />
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
                      <div className="flex items-center justify-between mb-6">
                        <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="button">
                            {t('saveChanges')}
                        </button>
                    </div>
                </form>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mb-6">
                    <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">App Preferences</h2>
                    <div className="space-y-6">
                        <div className="flex items-center justify-between py-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Notifications</label>
                            <input type="checkbox" className="form-checkbox h-5 w-5 text-indigo-600 bg-slate-700 border-slate-600 rounded focus:ring-indigo-500" id="emailNotif" />
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                    <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">Account</h2>
                    <button onClick={logOut} className="bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
                        Sign Out
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProfileSettings;
