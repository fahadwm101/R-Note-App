import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { auth, googleProvider } from '../lib/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, sendPasswordResetEmail } from 'firebase/auth';

const AuthCard: React.FC = () => {
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);
    const [isReset, setIsReset] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(false);



    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                // Sign in with email and password
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                // Create new account
                await createUserWithEmailAndPassword(auth, email, password);
            }
            // Navigate to dashboard on success
            navigate('/dashboard');
        } catch (err: any) {
            // Handle Firebase errors
            let errorMessage = 'An error occurred. Please try again.';

            switch (err.code) {
                case 'auth/email-already-in-use':
                    errorMessage = 'Email already in use';
                    break;
                case 'auth/wrong-password':
                    errorMessage = 'Wrong password';
                    break;
                case 'auth/user-not-found':
                    errorMessage = 'No account found with this email';
                    break;
                case 'auth/weak-password':
                    errorMessage = 'Password should be at least 6 characters';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Invalid email address';
                    break;
                case 'auth/invalid-credential':
                    errorMessage = 'Invalid email or password';
                    break;
            }

            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setError('');
        setSuccessMessage('');
        setLoading(true);

        try {
            // Use popup for better UX and to avoid redirect loops
            await signInWithPopup(auth, googleProvider);
            // User signed in successfully
            navigate('/dashboard');
        } catch (err: any) {
            console.error('Google Sign-In Error:', err);
            setError(`Failed to sign in: ${err.message}`);
            setLoading(false);
        }
    };

    const handlePasswordReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        setLoading(true);

        try {
            await sendPasswordResetEmail(auth, email);
            setSuccessMessage('Check your inbox for the reset link');
            setEmail('');
            // Switch back to login mode after 2 seconds
            setTimeout(() => {
                setIsReset(false);
                setSuccessMessage('');
            }, 3000);
        } catch (err: any) {
            let errorMessage = 'Failed to send reset email. Please try again.';

            switch (err.code) {
                case 'auth/user-not-found':
                    errorMessage = 'No account found with this email';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Invalid email address';
                    break;
            }

            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const toggleMode = () => {
        setIsLogin(!isLogin);
        setEmail('');
        setPassword('');
        setShowPassword(false);
        setError('');
        setSuccessMessage('');
        setIsReset(false);
    };

    return (
        <div className="relative z-20 w-full max-w-md mx-auto p-4" style={{ perspective: "1200px" }}>
            <AnimatePresence mode="wait">
                {/* Animated Gradient Border Container with 3D Slide */}
                <motion.div
                    key={isLogin ? 'login' : 'signup'}
                    initial={{
                        x: isLogin ? 100 : -100,
                        rotateY: isLogin ? 15 : -15,
                        opacity: 0
                    }}
                    animate={{
                        x: 0,
                        rotateY: 0,
                        opacity: 1
                    }}
                    exit={{
                        x: isLogin ? -100 : 100,
                        rotateY: isLogin ? -15 : 15,
                        opacity: 0
                    }}
                    transition={{
                        duration: 0.5,
                        ease: [0.4, 0, 0.2, 1]
                    }}
                    className="relative rounded-3xl p-[2px] overflow-hidden"
                    style={{ transformStyle: "preserve-3d" }}
                >
                    {/* Rotating Gradient Background (Continuous) */}
                    <motion.div
                        className="absolute inset-[-50%] w-[200%] h-[200%] top-[-50%] left-[-50%] bg-[conic-gradient(from_0deg,transparent_0_340deg,white_360deg)] opacity-50 blur-md"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                        style={{
                            background: 'conic-gradient(from 0deg, #818cf8, #c084fc, #f472b6, #fb923c, #818cf8)'
                        }}
                    />
                    <motion.div
                        className="absolute inset-[-50%] w-[200%] h-[200%] top-[-50%] left-[-50%] bg-[conic-gradient(from_0deg,transparent_0_340deg,white_360deg)] opacity-70"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                        style={{
                            background: 'conic-gradient(from 0deg, #818cf8, #c084fc, #f472b6, #fb923c, #818cf8)'
                        }}
                    />

                    {/* Inner Card Content */}
                    <div className="bg-[#0f0c29]/80 backdrop-blur-xl rounded-3xl relative h-full">
                        <div className="p-8 overflow-hidden relative rounded-3xl border border-white/5">

                            {/* Header: R.NOTE + Moon */}
                            <div className="flex flex-col items-center justify-center mb-8">
                                <div className="flex items-center gap-3 mb-2">
                                    <img src="/logo.png" alt="R.NOTE Logo" className="w-10 h-10 object-contain opacity-90" />
                                    <h1 className="text-3xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-white">
                                        R.NOTE
                                    </h1>
                                </div>
                                <p className="text-white/50 text-xs font-medium tracking-[0.2em] uppercase">
                                    {isReset ? 'Reset Password' : (isLogin ? 'Welcome Back Student' : 'Begin Your Journey')}
                                </p>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl text-sm">
                                    {error}
                                </div>
                            )}

                            {/* Success Message */}
                            {successMessage && (
                                <div className="bg-green-500/10 border border-green-500/50 text-green-400 px-4 py-3 rounded-xl text-sm">
                                    {successMessage}
                                </div>
                            )}

                            {/* Form Content (Directly rendered, no inner separate transition) */}
                            <form onSubmit={isReset ? handlePasswordReset : handleAuth} className="space-y-5">
                                {/* Email Input */}
                                <div className="space-y-1">
                                    <label className="text-sm text-gray-300 font-medium ml-1">Email Address</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="scholar@example.com"
                                        className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-xl focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 block p-3 placeholder-white/20 transition-all duration-200 outline-none backdrop-blur-sm shadow-inner"
                                        required
                                    />
                                </div>

                                {/* Password Input - Hide in reset mode */}
                                {!isReset && (
                                    <div className="space-y-1">
                                        <label className="text-sm text-gray-300 font-medium ml-1">Password</label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="••••••••"
                                                className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-xl focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 block p-3 pr-10 placeholder-white/20 transition-all duration-200 outline-none backdrop-blur-sm shadow-inner"
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/40 hover:text-white/80 transition-colors cursor-pointer"
                                            >
                                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Forgot Password (Login Only) */}
                                {isLogin && !isReset && (
                                    <div className="flex justify-end">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsReset(true);
                                                setError('');
                                                setSuccessMessage('');
                                            }}
                                            className="text-xs text-purple-300/80 hover:text-purple-300 hover:underline transition-colors"
                                        >
                                            Forgot Password?
                                        </button>
                                    </div>
                                )}

                                {/* Main Action Button */}
                                <motion.button
                                    whileHover={!loading ? { scale: 1.02, boxShadow: "0 0 15px rgba(168, 85, 247, 0.4)" } : {}}
                                    whileTap={!loading ? { scale: 0.98 } : {}}
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3 px-4 border border-white/10 rounded-xl shadow-[0_4px_14px_0_rgba(168,85,247,0.2)] text-sm font-bold text-white bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 bg-[length:200%_auto] hover:bg-right transition-all duration-500 mt-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                                    {loading ? 'Please wait...' : (isReset ? 'Send Reset Link' : (isLogin ? 'Log In' : 'Create Account'))}
                                </motion.button>

                                {/* Back to Login - Show in reset mode */}
                                {isReset && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsReset(false);
                                            setError('');
                                            setSuccessMessage('');
                                        }}
                                        className="w-full text-sm text-purple-300/80 hover:text-purple-300 transition-colors mt-2"
                                    >
                                        ← Back to Login
                                    </button>
                                )}
                            </form>

                            {/* Divider - Only show on Login */}
                            {isLogin && (
                                <div className="flex items-center justify-center my-8 gap-3">
                                    <div className="h-[1px] w-full bg-gradient-to-r from-transparent to-gray-600"></div>
                                    <span className="text-xs text-gray-500 uppercase tracking-wider whitespace-nowrap px-2">Or continue with</span>
                                    <div className="h-[1px] w-full bg-gradient-to-l from-transparent to-gray-600"></div>
                                </div>
                            )}

                            {/* Google Button - Only show on Login */}
                            {isLogin && (
                                <motion.button
                                    whileHover={!loading ? { scale: 1.02, backgroundColor: "rgba(255, 255, 255, 1)" } : {}}
                                    whileTap={!loading ? { scale: 0.98 } : {}}
                                    onClick={handleGoogleLogin}
                                    disabled={loading}
                                    type="button"
                                    className="w-full bg-white/90 text-gray-900 py-3 px-4 rounded-xl font-semibold hover:bg-white transition-all duration-200 flex items-center justify-center gap-3 shadow-lg"
                                >
                                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                    </svg>
                                    Continue with Google
                                </motion.button>
                            )}

                            {/* Footer Toggle - Hide in reset mode */}
                            {!isReset && (
                                <div className="flex flex-row items-center justify-center gap-2 mt-6">
                                    <span className="text-sm text-gray-400">
                                        {isLogin ? "Don't have an account?" : "Already have an account?"}
                                    </span>
                                    <button
                                        onClick={toggleMode}
                                        className="text-sm font-semibold text-purple-400 hover:text-purple-300 transition-colors cursor-pointer outline-none"
                                    >
                                        {isLogin ? "Sign Up" : "Log In"}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Copyright Footer */}
            <div className="mt-6 text-center">
                <p className="text-white/30 text-[11px] tracking-widest uppercase font-light">
                    © {new Date().getFullYear()} All rights reserved &mdash;{' '}
                    <a
                        href="https://r-i-s-e.vercel.app"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-400/60 hover:text-purple-300 transition-colors duration-200 font-medium tracking-wider"
                    >
                        R.I.S.E Team
                    </a>
                </p>
            </div>
        </div >
    );
};

export default AuthCard;
