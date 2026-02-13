import React from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const Login: React.FC = () => {
  const { signInWithGoogle } = useAuth();

  // Generate 400 glowing star particles
  const particles = React.useMemo(() => {
    return Array.from({ length: 400 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: Math.random() * 2 + 1, // 1-3px
      duration: Math.random() * 15 + 5, // 5-20s for variety
      delay: Math.random() * 20,
      glow: Math.random() > 0.5 ? '0 0 6px rgba(255,255,255,0.8)' : '0 0 4px rgba(173,216,230,0.8)', // white or light blue glow
    }));
  }, []);

  return (
    <div className="flex h-screen bg-gradient-to-b from-slate-950 to-black text-gray-900 dark:text-gray-100 relative overflow-hidden">
      {/* Magical Star Ascension Background */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute bottom-0 rounded-full bg-white"
          style={{
            left: `${particle.left}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            boxShadow: particle.glow,
          }}
          animate={{
            y: -window.innerHeight - 100,
            opacity: [0.2, 1, 0.2],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}

      <div className="relative z-10 flex items-center justify-center w-full h-full">
        <div className="bg-slate-900/50 backdrop-blur-2xl rounded-2xl p-8 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] max-w-md w-full mx-4 border-t border-white/20 border-x border-white/10 border-b border-white/5 hover:shadow-2xl hover:shadow-white/10 transition-all duration-300 animate-fadeInUp">
          <div className="text-center">
            <img src="/logo.png" alt="R.Note Logo" className="w-16 h-16 mx-auto mb-4" />
            <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-orange-400">R.NOTE</h1>
            <p className="text-gray-300 mb-6 text-sm uppercase tracking-widest">STUDY SMARTER, NOT HARDER</p>
            <button
              onClick={signInWithGoogle}
              className="w-full bg-white text-gray-900 py-3 px-4 rounded-lg font-semibold hover:bg-gray-50 hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="w-32 border-t border-white/10 mb-4"></div>
        <footer className="text-[10px] text-white/30 font-sans uppercase tracking-[0.3em]">
          © 2025 R.I.S.E TEAM. ALL RIGHTS RESERVED.
        </footer>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Login;