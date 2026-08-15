import React, { useState } from 'react';
import { Link } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import CwitterLogo from '../../elements/CwitterLogo';

const Register = ({ onSuccess, onSwitchToLogin }) => {
	const { register } = useAuth();

	const [formData, setFormData] = useState({
		fullName: '',
		username: '',
		email: '',
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
			[name]: name === 'username' ? value.toLowerCase().replace(/\s+/g, '') : value,
		}));
		if (error) setError('');
	};

	const handleValidation = () => {
		if (!formData.fullName.trim()) {
			setError('Full Name is required')
			return true;
		}
		if (!formData.username.trim()) {
			setError('Username is required')
			return true;
		}
		if (!formData.email.trim()) {
			setError('Email is required')
			return true;
		}
		if (!formData.password || formData.password.length < 6) {
			setError('Password must be at least 6 characters long')
			return true;
		}

		return false
	}

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError('');
		setSuccess('');

		// Validation
		if (handleValidation()) return;

		setLoading(true);

		try {

			const data = await register(formData)

			setSuccess('Account created successfully!');
		} catch (err) {
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
					{/* Cwitter Logo */}
					<div className="w-32 h-32 md:w-48 md:h-48 lg:w-56 lg:h-56 text-[#1d9bf0] flex items-center justify-center transition-transform hover:scale-105 duration-300 drop-shadow-[0_0_35px_rgba(29,155,240,0.4)]">
						<CwitterLogo />
					</div>

					<h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-tight">
						Happening now
					</h1>
					<h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#e7e9ea]">
						Join Cwitter today.
					</h2>
				</div>

				{/* Right Section: Sign Up Form Card with Increased Spacing */}
				<div className="w-full max-w-lg bg-[#000000] border border-[#2f3336] rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden">

					{/* Subtle Decorative Blur */}
					<div className="absolute -top-14 -right-14 w-40 h-40 bg-[#1d9bf0] opacity-15 rounded-full blur-3xl pointer-events-none"></div>

					{/* Form Header */}
					<div className="flex items-center justify-between pb-6 mb-6 border-b border-[#2f3336]">
						<h3 className="font-bold text-2xl text-white tracking-wide">Create your account</h3>
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

					{/* Registration Form using Flexbox Layout */}
					<form onSubmit={handleSubmit} className="flex flex-col gap-4">

						{/* Full Name */}
						<div className="flex flex-col gap-2">
							<label className="block text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">
								Full Name
							</label>
							<input
								type="text"
								name="fullName"
								value={formData.fullName}
								onChange={handleChange}
								placeholder="John Doe"
								required
								className="w-full bg-[#16181c] text-white placeholder-gray-500 border border-[#2f3336] rounded-2xl px-5 py-3.5 text-base focus:outline-none focus:border-[#1d9bf0] focus:ring-1 focus:ring-[#1d9bf0] transition-all"
							/>
						</div>

						{/* Username */}
						<div className="flex flex-col gap-2">
							<label className="block text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">
								Username
							</label>
							<div className="relative flex items-center">
								<span className="absolute left-5 text-gray-500 text-base font-medium">@</span>
								<input
									type="text"
									name="username"
									value={formData.username}
									onChange={handleChange}
									placeholder="johndoe"
									required
									className="w-full bg-[#16181c] text-white placeholder-gray-500 border border-[#2f3336] rounded-2xl pl-10 pr-5 py-3.5 text-base focus:outline-none focus:border-[#1d9bf0] focus:ring-1 focus:ring-[#1d9bf0] transition-all"
								/>
							</div>
						</div>

						{/* Email */}
						<div className="flex flex-col gap-2">
							<label className="block text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">
								Email Address
							</label>
							<input
								type="email"
								name="email"
								value={formData.email}
								onChange={handleChange}
								placeholder="name@example.com"
								required
								className="w-full bg-[#16181c] text-white placeholder-gray-500 border border-[#2f3336] rounded-2xl px-5 py-3.5 text-base focus:outline-none focus:border-[#1d9bf0] focus:ring-1 focus:ring-[#1d9bf0] transition-all"
							/>
						</div>

						{/* Password */}
						<div className="flex flex-col gap-2">
							<label className="block text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">
								Password
							</label>
							<div className="flex flex-col gap-1">
								<div className="relative flex items-center">
									<input
										type={showPassword ? 'text' : 'password'}
										name="password"
										value={formData.password}
										onChange={handleChange}
										placeholder="••••••••"
										required
										className="w-full bg-[#16181c] text-white placeholder-gray-500 border border-[#2f3336] rounded-2xl pl-5 pr-12 py-3.5 text-base focus:outline-none focus:border-[#1d9bf0] focus:ring-1 focus:ring-[#1d9bf0] transition-all"
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
								<p className="text-xs text-gray-500 pt-0.5 pl-1">Must be at least 6 characters</p>
							</div>
						</div>

						{/* Terms Disclaimer */}
						<p className="text-xs text-gray-500 leading-relaxed pt-1">
							By signing up, you agree to the{' '}
							<a href="#" className="text-[#1d9bf0] hover:underline font-medium">
								Terms of Service
							</a>{' '}
							and{' '}
							<a href="#" className="text-[#1d9bf0] hover:underline font-medium">
								Privacy Policy
							</a>
							, including Cookie Use.
						</p>

						{/* Submit Button */}
						<button
							type="submit"
							disabled={loading}
							className="w-full bg-[#1d9bf0] hover:bg-[#1a8cd8] active:bg-[#177cc0] text-white font-bold py-4 px-6 rounded-full transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg shadow-[#1d9bf0]/25 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-base mt-1"
						>
							{loading ? (
								<>
									<svg className="w-5 h-5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
										<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
										<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
									</svg>
									<span>Creating account...</span>
								</>
							) : (
								<span>Create account</span>
							)}
						</button>
					</form>

					{/* Already have an account link */}
					<div className="mt-8 pt-6 border-t border-[#2f3336] text-center">
						<p className="text-sm text-gray-400">
							Already have an account?{' '}
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

export default Register;
