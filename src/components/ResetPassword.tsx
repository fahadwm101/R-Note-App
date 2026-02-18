import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { auth } from '../lib/firebase';
import { confirmPasswordReset } from 'firebase/auth';

const ResetPassword: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const oobCode = searchParams.get('oobCode');

    const [newPassword, setNewPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // Check if code exists on mount
    useEffect(() => {
        if (!oobCode) {
            setError('Invalid or missing reset code. Please request a new password reset link.');
        }
    }, [oobCode]);

    const handlePasswordReset = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!oobCode) return;

        setError('');
        setSuccessMessage('');
        setLoading(true);

        try {
            await confirmPasswordReset(auth, oobCode, newPassword);
            setSuccessMessage('Password changed successfully!');
            setNewPassword('');
            // Auto-redirect to login after 2 seconds
            setTimeout(() => {
                navigate('/');
            }, 2000);
        } catch (err: any) {
            let errorMessage = 'Failed to reset password. Please try again.';

            switch (err.code) {
                case 'auth/expired-action-code':
                    errorMessage = 'This link has expired. Please request a new password reset link.';
                    break;
                case 'auth/invalid-action-code':
                    errorMessage = 'Invalid reset link. Please request a new password reset link.';
                    break;
                case 'auth/weak-password':
                    errorMessage = 'Password should be at least 6 characters';
                    break;
            }

            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Generate star particles for the background (same as Login)
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
            {/* Background: Rising Stars */}
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

            {/* Reset Password Card */}
            <div className="relative z-20 w-full max-w-md mx-auto p-4" style={{ perspective: "1200px" }}>
                <motion.div
                    initial={{ scale: 1.2, opacity: 0, filter: "blur(10px)" }}
                    animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    className="relative rounded-3xl p-[2px] overflow-hidden"
                >
                    {/* Rotating Gradient Background */}
                    <motion.div
                        className="absolute inset-0 rounded-3xl opacity-50 blur-xl"
                        animate={{
                            background: [
                                'conic-gradient(from 0deg, #818cf8, #c084fc, #f472b6, #fb923c, #818cf8)',
                                'conic-gradient(from 360deg, #818cf8, #c084fc, #f472b6, #fb923c, #818cf8)',
                            ],
                        }}
                        transition={{
                            duration: 8,
                            repeat: Infinity,
                            ease: "linear",
                        }}
                    />

                    {/* Animated Border */}
                    <motion.div
                        className="absolute inset-0 rounded-3xl"
                        style={{
                            background: 'conic-gradient(from 0deg, #818cf8, #c084fc, #f472b6, #fb923c, #818cf8)',
                        }}
                        animate={{
                            rotate: 360,
                        }}
                        transition={{
                            duration: 8,
                            repeat: Infinity,
                            ease: "linear",
                        }}
                    />

                    {/* Content Container */}
                    <div className="relative bg-[#020204] rounded-3xl p-8 backdrop-blur-xl">
                        {/* Header */}
                        <div className="text-center mb-6">
                            <div className="flex items-center justify-center mb-3">
                                <img
                                    src="/logo.png"
                                    alt="R.NOTE"
                                    className="h-12 w-12 opacity-90"
                                />
                            </div>
                            <div className="mb-2">
                                <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-purple-200">
                                    Reset Your Password
                                </h1>
                            </div>
                            <p className="text-white/50 text-xs font-medium tracking-[0.2em] uppercase">
                                Create a new secure password
                            </p>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl text-sm mb-4">
                                {error}
                            </div>
                        )}

                        {/* Success Message */}
                        {successMessage && (
                            <div className="bg-green-500/10 border border-green-500/50 text-green-400 px-4 py-3 rounded-xl text-sm mb-4">
                                {successMessage}
                            </div>
                        )}

                        {/* Form */}
                        {!successMessage && oobCode && (
                            <form onSubmit={handlePasswordReset} className="space-y-5">
                                {/* New Password Input */}
                                <div className="space-y-1">
                                    <label className="text-sm text-gray-300 font-medium ml-1">New Password</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-xl focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 block p-3 pr-10 placeholder-white/20 transition-all duration-200 outline-none backdrop-blur-sm shadow-inner"
                                            required
                                            minLength={6}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/40 hover:text-white/80 transition-colors cursor-pointer"
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-500 ml-1 mt-1">Minimum 6 characters</p>
                                </div>

                                {/* Submit Button */}
                                <motion.button
                                    whileHover={!loading ? { scale: 1.02, boxShadow: "0 0 15px rgba(168, 85, 247, 0.4)" } : {}}
                                    whileTap={!loading ? { scale: 0.98 } : {}}
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3 px-4 border border-white/10 rounded-xl shadow-[0_4px_14px_0_rgba(168,85,247,0.2)] text-sm font-bold text-white bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 bg-[length:200%_auto] hover:bg-right transition-all duration-500 mt-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                                    {loading ? 'Updating Password...' : 'Update Password'}
                                </motion.button>

                                {/* Back to Login */}
                                <button
                                    type="button"
                                    onClick={() => navigate('/')}
                                    className="w-full text-sm text-purple-300/80 hover:text-purple-300 transition-colors mt-2"
                                >
                                    ← Back to Login
                                </button>
                            </form>
                        )}

                        {/* Success State - Show Login Button */}
                        {successMessage && (
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => navigate('/')}
                                className="w-full py-3 px-4 border border-white/10 rounded-xl shadow-[0_4px_14px_0_rgba(168,85,247,0.2)] text-sm font-bold text-white bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 bg-[length:200%_auto] hover:bg-right transition-all duration-500"
                            >
                                Go to Login
                            </motion.button>
                        )}

                        {/* Invalid Code State */}
                        {!oobCode && (
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => navigate('/')}
                                className="w-full py-3 px-4 border border-white/10 rounded-xl shadow-[0_4px_14px_0_rgba(168,85,247,0.2)] text-sm font-bold text-white bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 bg-[length:200%_auto] hover:bg-right transition-all duration-500"
                            >
                                Back to Login
                            </motion.button>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default ResetPassword;
