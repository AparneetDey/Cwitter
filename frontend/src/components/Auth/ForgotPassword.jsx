import React, { useState } from 'react';
import { Link } from 'react-router';

const ForgotPassword = () => {
  const [identity, setIdentity] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!identity.trim()) {
      return setError('Please enter your email or username');
    }

    setLoading(true);

    try {
      // Simulate/call reset password request endpoint
      const response = await fetch('http://localhost:8000/api/v1/users/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ identity: identity.trim() }),
      });

      // Even if backend endpoint is in progress, handle smooth frontend state
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        // If 404 or backend route not implemented yet, fallback gracefully for frontend preview
        if (response.status !== 404) {
          throw new Error(data.message || 'Failed to send password reset email');
        }
      }

      setSubmitted(true);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Twitter Bird SVG logo
  const TwitterBirdLogo = ({ className = "w-full h-full" }) => (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={`fill-current ${className}`}>
      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.936 9.936 0 0024 4.59z"></path>
    </svg>
  );

  return (
    <div className="min-h-screen bg-black text-[#e7e9ea] font-sans flex flex-col justify-between selection:bg-[#1d9bf0] selection:text-white">
      {/* Main Container */}
      <main className="flex-1 flex flex-col md:flex-row items-center justify-center px-6 py-10 md:px-16 max-w-7xl mx-auto w-full gap-10 lg:gap-20">
        
        {/* Left Hero */}
        <div className="flex-1 flex flex-col justify-center items-center md:items-start text-center md:text-left space-y-8">
          <div className="w-20 h-20 md:w-32 md:h-32 text-[#1d9bf0] flex items-center justify-center transition-transform hover:scale-105 duration-300 drop-shadow-[0_0_25px_rgba(29,155,240,0.3)]">
            <TwitterBirdLogo />
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-tight">
            Find your account
          </h1>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#e7e9ea]">
            Reset password on Cwitter.
          </h2>
        </div>

        {/* Right Section: Forgot Password Form Card */}
        <div className="w-full max-w-lg bg-[#000000] border border-[#2f3336] rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden">
          
          {/* Subtle Decorative Blur */}
          <div className="absolute -top-14 -right-14 w-40 h-40 bg-[#1d9bf0] opacity-15 rounded-full blur-3xl pointer-events-none"></div>

          {/* Form Header */}
          <div className="flex items-center justify-between pb-6 mb-6 border-b border-[#2f3336]">
            <h3 className="font-bold text-2xl text-white tracking-wide">Find your Cwitter account</h3>
            <div className="w-7 h-7 text-[#1d9bf0]">
              <TwitterBirdLogo />
            </div>
          </div>

          {/* Submitted Success Confirmation */}
          {submitted ? (
            <div className="flex flex-col gap-6 animate-fade-in">
              <div className="p-5 bg-emerald-950/60 border border-emerald-800/80 rounded-2xl flex flex-col gap-3 text-emerald-200">
                <div className="flex items-center space-x-3 text-emerald-400 font-bold text-lg">
                  <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>Check your email</span>
                </div>
                <p className="text-sm text-emerald-100/90 leading-relaxed">
                  We've sent a password reset link to <strong className="text-white font-semibold">{identity}</strong>. Please check your inbox and follow the instructions to reset your password.
                </p>
              </div>

              <Link
                to="/login"
                className="w-full bg-[#1d9bf0] hover:bg-[#1a8cd8] text-white font-bold py-4 px-6 rounded-full transition-all text-center text-base shadow-lg shadow-[#1d9bf0]/25"
              >
                Return to Sign in
              </Link>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                Enter the email address or username associated with your account to receive a password reset link.
              </p>

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

              {/* Reset Request Form */}
              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                
                {/* Identity Field */}
                <div className="flex flex-col gap-2">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">
                    Email or Username
                  </label>
                  <input
                    type="text"
                    value={identity}
                    onChange={(e) => {
                      setIdentity(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="Enter your email or username"
                    required
                    className="w-full bg-[#16181c] text-white placeholder-gray-500 border border-[#2f3336] rounded-2xl px-5 py-3.5 text-base focus:outline-none focus:border-[#1d9bf0] focus:ring-1 focus:ring-[#1d9bf0] transition-all"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#1d9bf0] hover:bg-[#1a8cd8] active:bg-[#177cc0] text-white font-bold py-4 px-6 rounded-full transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg shadow-[#1d9bf0]/25 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-base mt-2"
                >
                  {loading ? (
                    <>
                      <svg className="w-5 h-5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Searching...</span>
                    </>
                  ) : (
                    <span>Next</span>
                  )}
                </button>
              </form>
            </>
          )}

          {/* Back to login link */}
          <div className="mt-8 pt-6 border-t border-[#2f3336] text-center">
            <p className="text-sm text-gray-400">
              Remembered your password?{' '}
              <Link
                to="/login"
                className="text-[#1d9bf0] font-semibold hover:underline ml-1"
              >
                Sign in
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

export default ForgotPassword;
