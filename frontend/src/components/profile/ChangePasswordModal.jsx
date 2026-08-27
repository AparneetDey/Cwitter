import React, { useState } from 'react';
import { X, Lock, Eye, EyeOff, Loader2, AlertCircle, ShieldCheck } from 'lucide-react';
import api from '../../utils/axiosApi.util';

const ChangePasswordModal = ({ isOpen, onClose, showToast }) => {
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.oldPassword) {
      return setError('Please enter your current password.');
    }

    if (formData.newPassword.length < 6) {
      return setError('New password must be at least 6 characters long.');
    }

    if (formData.newPassword !== formData.confirmPassword) {
      return setError('New password and confirm password do not match.');
    }

    setLoading(true);

    try {
      await api.patch('/users/update/password', {
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword,
      });

      if (showToast) showToast('Password changed successfully! 🎉');

      setFormData({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

      onClose();
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to change password. Please check your current password.';
      setError(msg === 'Unauthorized Request' ? 'Current password is incorrect.' : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 select-none animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-black border border-[#2f3336] rounded-3xl w-full max-w-md shadow-2xl overflow-hidden relative animate-scale-up"
      >
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-[#2f3336] flex items-center justify-between bg-black/90">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-[#1d9bf0]/10 rounded-full text-[#1d9bf0]">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-xl text-white">Change Password</h3>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-2 rounded-full hover:bg-[#181818] text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Error Alert */}
          {error && (
            <div className="p-3.5 bg-red-950/60 border border-red-800/80 rounded-2xl flex items-center space-x-2.5 text-red-200 text-xs">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Current Password */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider pl-1">
              Current Password
            </label>
            <div className="relative flex items-center">
              <input
                type={showOldPassword ? 'text' : 'password'}
                name="oldPassword"
                value={formData.oldPassword}
                onChange={handleChange}
                placeholder="Enter current password"
                required
                className="cwitter-input !px-4 !pr-10 !py-3 !text-sm"
              />
              <button
                type="button"
                onClick={() => setShowOldPassword(!showOldPassword)}
                className="absolute right-3 text-gray-500 hover:text-white p-1 cursor-pointer"
              >
                {showOldPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider pl-1">
              New Password
            </label>
            <div className="relative flex items-center">
              <input
                type={showNewPassword ? 'text' : 'password'}
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="At least 6 characters"
                required
                className="cwitter-input !px-4 !pr-10 !py-3 !text-sm"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 text-gray-500 hover:text-white p-1 cursor-pointer"
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm New Password */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider pl-1">
              Confirm New Password
            </label>
            <div className="relative flex items-center">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter new password"
                required
                className="cwitter-input !px-4 !pr-10 !py-3 !text-sm"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 text-gray-500 hover:text-white p-1 cursor-pointer"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Action Button */}
          <div className="pt-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1d9bf0] hover:bg-[#1a8cd8] text-white font-bold py-3 px-4 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-sm flex items-center justify-center space-x-2 shadow-lg shadow-[#1d9bf0]/20"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Updating Password...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Update Password</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
