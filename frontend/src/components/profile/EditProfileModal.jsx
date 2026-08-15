import React, { useState } from 'react';
import { X, Camera, Loader2, AlertCircle } from 'lucide-react';
import api from '../../utils/axiosApi.util';
import { useAuth } from '../../context/AuthContext';

const EditProfileModal = ({ isOpen, onClose, user, onProfileUpdated }) => {
  const { setUser } = useAuth();

  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    username: user?.username || '',
    avatar: user?.avatar || '',
    coverImage: user?.coverImage || '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'username' ? value.toLowerCase().replace(/\s+/g, '') : value,
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.fullName.trim() && !formData.username.trim()) {
      return setError('At least one field is required');
    }

    setLoading(true);

    try {
      // 1. Update text details (username, fullName)
      const detailsRes = await api.patch('/users/update/details', {
        fullName: formData.fullName.trim(),
        username: formData.username.trim(),
      });

      let updatedUserData = detailsRes.data?.data;

      // 2. Update Avatar if changed
      if (formData.avatar && formData.avatar !== user?.avatar) {
        await api.patch('/users/update/avatar', { avatarUrl: formData.avatar });
        updatedUserData = { ...updatedUserData, avatar: formData.avatar };
      }

      // 3. Update Cover Image if changed
      if (formData.coverImage && formData.coverImage !== user?.coverImage) {
        await api.patch('/users/update/cover-image', { coverImageUrl: formData.coverImage });
        updatedUserData = { ...updatedUserData, coverImage: formData.coverImage };
      }

      // Update local auth user state
      if (setUser) {
        setUser((prev) => ({ ...prev, ...updatedUserData }));
      }
      if (onProfileUpdated) {
        onProfileUpdated(updatedUserData);
      }

      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-white/10 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#000000] border border-[#2f3336] rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-fade-in">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2f3336]">
          <div className="flex items-center space-x-4">
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-[#181818] text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-bold text-xl text-white">Edit profile</h3>
          </div>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="cwitter-btn-secondary"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
          </button>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="m-4 p-3.5 bg-red-950/60 border border-red-800/80 rounded-xl flex items-center space-x-3 text-red-200 text-sm">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          
          {/* Full Name */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider pl-1">
              Name
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Full Name"
              required
              className="cwitter-input !px-4 !py-3 !text-sm"
            />
          </div>

          {/* Username */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider pl-1">
              Username
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-gray-500 text-sm font-medium">@</span>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="username"
                required
                className="cwitter-input !pl-9 !pr-4 !py-3 !text-sm"
              />
            </div>
          </div>

          {/* Avatar URL */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider pl-1">
              Avatar Image URL
            </label>
            <input
              type="text"
              name="avatar"
              value={formData.avatar}
              onChange={handleChange}
              placeholder="https://example.com/avatar.jpg"
              className="cwitter-input !px-4 !py-3 !text-sm"
            />
          </div>

          {/* Cover Image URL */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider pl-1">
              Cover Image URL
            </label>
            <input
              type="text"
              name="coverImage"
              value={formData.coverImage}
              onChange={handleChange}
              placeholder="https://example.com/cover.jpg"
              className="cwitter-input !px-4 !py-3 !text-sm"
            />
          </div>

        </form>

      </div>
    </div>
  );
};

export default EditProfileModal;
