import React from 'react';
import { motion } from 'framer-motion';
import AuthCard from './AuthCard';

const Login: React.FC = () => {

  // Generate star particles for the background
  const particles = React.useMemo(() => {
    return Array.from({ length: 300 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 20 + 10,
      delay: Math.random() * 10,
      opacity: Math.random() * 0.5 + 0.5,
    }));
  }, []);

  return (
    <div className="min-h-screen w-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1F1D36] via-[#100F1E] to-[#000000] overflow-hidden flex items-center justify-center relative font-sans">
      {/* 1. Background: Rising Stars */}
      <div className="absolute inset-0 z-0">

        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute bg-white rounded-full"
            style={{
              left: `${particle.left}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              opacity: particle.opacity,
              bottom: '-10px',
            }}
            animate={{
              y: -window.innerHeight - 20,
              opacity: [0, particle.opacity, 0],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              delay: particle.delay,
              ease: "linear",
            }}
          />
        ))}
      </div>

      {/* Auth Card */}
      <div className="relative z-10 w-full flex justify-center px-4">
        <AuthCard />
      </div>

    </div>
  );
};

export default Login;