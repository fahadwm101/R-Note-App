import React from 'react';
import { ICONS } from '../constants';
import { useLanguage } from '../LanguageContext';

interface HeaderProps {
    toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
    const { language, t, switchLanguage } = useLanguage();
    const [avatar, setAvatar] = React.useState<string>('/logo.png');
    const [studentName, setStudentName] = React.useState<string>('Student');

    React.useEffect(() => {
        const savedAvatar = localStorage.getItem('avatar');
        if (savedAvatar) setAvatar(savedAvatar);
        const savedName = localStorage.getItem('studentName');
        if (savedName) setStudentName(savedName);
    }, []);

    return (
        <header className="bg-white/80 dark:bg-black/50 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 transition-colors duration-300">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <button
                            onClick={toggleSidebar}
                            className="text-slate-500 dark:text-gray-300 focus:outline-none lg:hidden me-4 hover:text-slate-700 dark:hover:text-white transition-colors"
                            aria-label="Open sidebar"
                        >
                            {ICONS.menu}
                        </button>
                        <div className="flex-shrink-0 flex items-center">
                            <img src="/logo.png" alt="R.Note Logo" className="h-8 w-8 object-contain" />
                            <span className="ms-2 text-2xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-orange-500 dark:via-purple-500 dark:to-indigo-500 bg-clip-text text-transparent transition-all duration-300">{t('rNote')}</span>
                        </div>
                    </div>
                    <div className="flex items-center">
                        <button
                            onClick={() => switchLanguage(language === 'en' ? 'ar' : 'en')}
                            className="px-3 py-1 text-sm bg-slate-100 dark:bg-gray-800 text-slate-700 dark:text-gray-300 rounded-full border border-slate-200 dark:border-gray-700 hover:bg-slate-200 dark:hover:bg-gray-700 transition-all duration-200 shadow-sm"
                        >
                            {language === 'en' ? 'العربية' : 'English'}
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
