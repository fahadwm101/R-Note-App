import React, { useEffect, useState } from 'react';
import { ICONS } from '../constants';
import { useLanguage } from '../LanguageContext';

interface PageTourProps {
    pageKey: string;
    title: string;
    description: string;
    features: string[];
}

const PageTour: React.FC<PageTourProps> = ({ pageKey, title, description, features }) => {
    const [isVisible, setIsVisible] = useState(false);
    const { t } = useLanguage();

    useEffect(() => {
        const hasSeenTour = localStorage.getItem(`rnote_tour_${pageKey}`);
        if (!hasSeenTour) {
            // Small delay for better UX (let page load first)
            const timer = setTimeout(() => {
                setIsVisible(true);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [pageKey]);

    const handleDismiss = () => {
        localStorage.setItem(`rnote_tour_${pageKey}`, 'true');
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop with blur and fade in */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-500 ease-in-out"
                onClick={handleDismiss} // Click outside to dismiss
            ></div>

            {/* Tour Card */}
            <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all duration-500 ease-out animate-in fade-in zoom-in-95 slide-in-from-bottom-4">
                {/* Decorative Icon Background */}
                <div className="absolute -top-12 left-1/2 transform -translate-x-1/2">
                    <div className="bg-indigo-600 rounded-full p-4 shadow-lg shadow-indigo-500/40">
                        <div className="text-white w-8 h-8">
                            {ICONS.rocket}
                        </div>
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                        {title}
                    </h2>
                    <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                        {description}
                    </p>

                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 mb-6 text-left">
                        <ul className="space-y-3">
                            {features.map((feature, index) => (
                                <li key={index} className="flex items-start text-sm text-slate-700 dark:text-slate-200">
                                    <span className="text-green-500 mr-2 mt-0.5">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </span>
                                    {feature}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <button
                        onClick={handleDismiss}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-indigo-500/30 transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                        {t('gotIt') || "Got it!"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PageTour;
