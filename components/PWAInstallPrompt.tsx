import React, { useState, useEffect, useCallback } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────
interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const STORAGE_KEY = 'pwa_prompt_dismissed_at';
const COOLDOWN_MS = 86_400_000; // 24 hours

// ─── Helper ───────────────────────────────────────────────────────────────────
const isInCooldown = (): boolean => {
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (!dismissed) return false;
    return Date.now() - parseInt(dismissed, 10) < COOLDOWN_MS;
};

const isStandalone = (): boolean =>
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true;

// ─── Component ────────────────────────────────────────────────────────────────
const PWAInstallPrompt: React.FC = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        // Never show if already installed or in cooldown
        if (isStandalone() || isInCooldown()) return;

        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            // Show with a small delay for better UX
            setTimeout(() => setIsVisible(true), 1500);
        };

        window.addEventListener('beforeinstallprompt', handler);
        window.addEventListener('appinstalled', () => hide(false));

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
        };
    }, []);

    const hide = useCallback((saveCooldown = true) => {
        setIsExiting(true);
        if (saveCooldown) {
            localStorage.setItem(STORAGE_KEY, Date.now().toString());
        }
        setTimeout(() => {
            setIsVisible(false);
            setIsExiting(false);
            setDeferredPrompt(null);
        }, 350);
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        hide(outcome !== 'accepted');
    };

    if (!isVisible || !deferredPrompt) return null;

    return (
        <div
            className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] w-[calc(100%-2rem)] max-w-sm transition-all duration-350 ${isExiting
                    ? 'opacity-0 translate-y-4 scale-95'
                    : 'opacity-100 translate-y-0 scale-100'
                }`}
            style={{ transition: 'opacity 350ms ease, transform 350ms cubic-bezier(0.34, 1.56, 0.64, 1)' }}
            role="dialog"
            aria-label="تثبيت التطبيق"
        >
            {/* Glass Card */}
            <div className="relative overflow-hidden rounded-2xl border border-white/20 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.18)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)]">

                {/* Accent gradient strip */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-500" />

                <div className="p-5">
                    {/* Header row */}
                    <div className="flex items-start gap-3 mb-4">
                        {/* App Icon */}
                        <div className="shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
                            <img src="/logo.png" alt="R.NOTE" className="w-8 h-8 object-contain" onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                            }} />
                        </div>

                        {/* Text */}
                        <div className="flex-1 min-w-0" dir="rtl">
                            <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                                ثبّت مساحتك الدراسية 🚀
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                                ثبّت R.NOTE على جهازك للوصول السريع، ودعم وضع الأوفلاين.
                            </p>
                        </div>

                        {/* Close X */}
                        <button
                            onClick={() => hide(true)}
                            className="shrink-0 w-6 h-6 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                            aria-label="إغلاق"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 mt-1" dir="rtl">
                        <button
                            onClick={handleInstall}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-semibold shadow-md shadow-indigo-500/30 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            تثبيت التطبيق
                        </button>
                        <button
                            onClick={() => hide(true)}
                            className="px-4 py-2.5 rounded-xl text-slate-500 dark:text-slate-400 text-sm font-medium hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                        >
                            لاحقاً
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PWAInstallPrompt;
