
import React from 'react';

const RamadanDecor: React.FC = () => {
    return (
        <>
            {/* 🌟 Gold Ramadan Pattern - Scattered stroke-only shapes */}
            <div
                className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Cg fill='none' stroke='%23D4AF37' stroke-opacity='0.35' stroke-width='1.2'%3E%3C!-- 5-point star top-left --%3E%3Cpolygon points='20,6 22,14 30,14 24,19 26,27 20,22 14,27 16,19 10,14 18,14'/%3E%3C!-- Crescent top-right --%3E%3Cpath d='M165 18 a16 16 0 1 0 18 18 a11 11 0 1 1 -18 -18z'/%3E%3C!-- Small star center --%3E%3Cpolygon points='100,80 101.5,85 107,85 102.5,88 104,93 100,90 96,93 97.5,88 93,85 98.5,85'/%3E%3C!-- Lantern bottom-left --%3E%3Crect x='28' y='148' width='14' height='22' rx='3'/%3E%3Cline x1='35' y1='148' x2='35' y2='140'/%3E%3Cpolygon points='35,144 42,148 28,148'/%3E%3Cpolygon points='35,170 42,175 28,175'/%3E%3Cline x1='29' y1='158' x2='41' y2='158'/%3E%3C!-- Crescent bottom-right --%3E%3Cpath d='M168 155 a12 12 0 1 0 14 14 a8 8 0 1 1 -14 -14z'/%3E%3C!-- Tiny star mid-right --%3E%3Cpolygon points='175,90 176,94 180,94 177,97 178,101 175,98 172,101 173,97 170,94 174,94'/%3E%3C!-- Lantern top-center --%3E%3Crect x='88' y='20' width='12' height='18' rx='2'/%3E%3Cline x1='94' y1='20' x2='94' y2='13'/%3E%3Cpolygon points='94,16 100,20 88,20'/%3E%3Cpolygon points='94,38 100,42 88,42'/%3E%3C/g%3E%3C/svg%3E")`,
                    backgroundSize: '200px 200px',
                }}
            />

            {/* 🏮 Lantern + 🌙 Crescent - On top of content (z-50) */}
            <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
                {/* 🏮 Fanoos (Lantern) - Top Left - Swinging */}
                <div className="absolute top-0 left-2 sm:left-4 md:left-6 animate-swing origin-top">
                    <div className="w-0.5 sm:w-1 bg-slate-800 dark:bg-gold-500 h-10 sm:h-20 mx-auto"></div>
                    <svg width="35" height="60" viewBox="0 0 60 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="sm:w-[50px] sm:h-[85px] drop-shadow-[0_0_15px_rgba(251,191,36,0.6)]">
                        {/* Lantern Top */}
                        <path d="M30 0L45 15H15L30 0Z" className="fill-slate-800 dark:fill-gold-500" />
                        {/* Lantern Body */}
                        <rect x="10" y="15" width="40" height="50" rx="5" className="fill-slate-800/80 dark:fill-gold-500/80 stroke-gold-500 stroke-2" />
                        {/* Glass/Light */}
                        <rect x="18" y="22" width="24" height="36" rx="2" className="fill-yellow-100/50 dark:fill-yellow-200/80 animate-pulse" />
                        {/* Lantern Base */}
                        <path d="M15 65L10 80H50L45 65H15Z" className="fill-slate-800 dark:fill-gold-500" />
                        {/* Bottom Loop */}
                        <circle cx="30" cy="85" r="5" className="fill-slate-800 dark:fill-gold-500" />
                    </svg>
                </div>
            </div>
        </>
    );
};

export default RamadanDecor;
