import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import CwitterLogo from '../../elements/CwitterLogo';

const Login = () => {
    const navigate = useNavigate();
    const {login} = useAuth();

    const [formData, setFormData] = useState({
        identity: '',
        password: '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        if (error) setError('');
    };

    const handleValidation = () => {
        if (!formData.identity.trim()) {
            setError('Username or Email is required')
            return true;
        }
        if (!formData.password) {
            setError('Password is required')
            return true;
        }

        return false;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        
        if(handleValidation()) return;
        
        setLoading(true);

        try {
            const data = await login(formData);

            setSuccess('Logged in successfully!');
            setTimeout(() => {
                navigate('/');
            }, 1000);
        } catch (err) {
            console.log(err)
            setError(err?.response?.data?.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-[#e7e9ea] font-sans flex flex-col justify-between selection:bg-[#1d9bf0] selection:text-white">
            {/* Main Container */}
            <main className="flex-1 flex flex-col md:flex-row items-center justify-center px-6 py-10 md:px-16 max-w-7xl mx-auto w-full gap-10 lg:gap-20">
                
                {/* Left Hero: Cwitter Bird Logo & Slogan */}
                <div className="flex-1 flex flex-col justify-center items-center md:items-start text-center md:text-left space-y-8">
                    <div className="w-32 h-32 md:w-48 md:h-48 lg:w-56 lg:h-56 text-[#1d9bf0] flex items-center justify-center transition-transform hover:scale-105 duration-300 drop-shadow-[0_0_35px_rgba(29,155,240,0.4)]">
                        <CwitterLogo />
                    </div>

                    <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-tight">
                        Happening now
                    </h1>
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#e7e9ea]">
                        Sign in to Cwitter.
                    </h2>
                </div>

                {/* Right Section: Sign In Form Card */}
                <div className="w-full max-w-lg cwitter-card">
                    
                    {/* Subtle Decorative Blur */}
                    <div className="absolute -top-14 -right-14 w-40 h-40 bg-[#1d9bf0] opacity-15 rounded-full blur-3xl pointer-events-none"></div>

                    {/* Form Header */}
                    <div className="flex items-center justify-between pb-6 mb-6 border-b border-[#2f3336]">
                        <h3 className="font-bold text-2xl text-white tracking-wide">Sign in to your account</h3>
                        <div className="w-10 h-10 text-[#1d9bf0]">
                            <CwitterLogo />
                        </div>
                    </div>

                    {/* Error Banner */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-950/60 border border-red-800/80 rounded-2xl flex items-start space-x-3 text-red-200 text-sm animate-fade-in">
                            <svg className="w-5 h-5 text-red-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <circle cx="12" cy="12" r="10" strokeWidth="2"></circle>
                                <path strokeWidth="2" d="M12 8v4m0 4h.01"></path>
                            </svg>
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Success Banner */}
                    {success && (
                        <div className="mb-6 p-4 bg-emerald-950/60 border border-emerald-800/80 rounded-2xl flex items-center space-x-3 text-emerald-200 text-sm animate-fade-in">
                            <svg className="w-5 h-5 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                            <span>{success}</span>
                        </div>
                    )}

                    {/* Login Form using Flexbox Layout */}
                    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                        
                        {/* Identity (Username or Email) */}
                        <div className="flex flex-col gap-2">
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">
                                Username or Email
                            </label>
                            <input
                                type="text"
                                name="identity"
                                value={formData.identity}
                                onChange={handleChange}
                                placeholder="Username or email"
                                required
                                className="cwitter-input"
                            />
                        </div>

                        {/* Password */}
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between pl-1">
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">
                                    Password
                                </label>
                                <Link
                                    to="/forgot-password"
                                    className="text-xs text-[#1d9bf0] font-semibold hover:underline"
                                >
                                    Forgot password?
                                </Link>
                            </div>
                            <div className="relative flex items-center">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    required
                                    className="cwitter-input pr-12"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 text-gray-400 hover:text-white p-1.5 rounded-lg transition-colors"
                                    title={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22"></path>
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="cwitter-btn-primary mt-2"
                        >
                            {loading ? (
                                <>
                                    <svg className="w-5 h-5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>Signing in...</span>
                                </>
                            ) : (
                                <span>Sign in</span>
                            )}
                        </button>
                    </form>

                    {/* Don't have an account link */}
                    <div className="mt-8 pt-6 border-t border-[#2f3336] text-center">
                        <p className="text-sm text-gray-400">
                            Don't have an account?{' '}
                            <Link
                                to="/register"
                                className="text-[#1d9bf0] font-semibold hover:underline ml-1"
                            >
                                Sign up
                            </Link>
                        </p>
                    </div>
                </div>

            </main>

            {/* Footer */}
            <footer className="py-5 px-6 text-center text-xs text-gray-500 border-t border-[#16181c] flex flex-wrap justify-center gap-x-5 gap-y-2">
                <a href="#" className="hover:underline">About</a>
                <a href="#" className="hover:underline">Help Center</a>
                <a href="#" className="hover:underline">Terms of Service</a>
                <a href="#" className="hover:underline">Privacy Policy</a>
                <a href="#" className="hover:underline">Cookie Policy</a>
                <span>© 2026 Cwitter, Inc.</span>
            </footer>
        </div>
    );
};

export default Login;
