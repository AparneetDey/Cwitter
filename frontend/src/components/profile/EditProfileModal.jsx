import React, { useState } from 'react';
import { X, Camera, Loader2, AlertCircle, Mail, User as UserIcon, AtSign, FileText, Image as ImageIcon, MapPin } from 'lucide-react';
import api from '../../utils/axiosApi.util';
import { useAuth } from '../../context/AuthContext';
import { getAvatarUrl } from '../../utils/constants';

const GithubIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

const EditProfileModal = ({ isOpen, onClose, user, onProfileUpdated }) => {
  const { setUser } = useAuth();

  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    username: user?.username || '',
    email: user?.email || '',
    location: user?.location || '',
    description: user?.description || user?.bio || '',
    githubLink: user?.githubLink || '',
    avatar: user?.avatar || '',
    coverImage: user?.coverImage || '',
  });

  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [showCoverPicker, setShowCoverPicker] = useState(false);
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

  const handleAvatarClick = () => {
    setShowAvatarPicker(true);
  };

  const handleCoverClick = () => {
    setShowCoverPicker(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.fullName.trim() && !formData.username.trim() && !formData.email.trim()) {
      return setError('Name, Username, and Email are required');
    }

    setLoading(true);

    try {
      // 1. Update text details (username, fullName, email, location, description, githubLink)
      const detailsRes = await api.patch('/users/update/details', {
        fullName: formData.fullName.trim(),
        username: formData.username.trim(),
        email: formData.email.trim(),
        location: formData.location.trim(),
        description: formData.description.trim(),
        githubLink: formData.githubLink.trim(),
      });

      let updatedUserData = detailsRes.data?.data || {};

      // 2. Update Avatar if changed via click
      if (formData.avatar && formData.avatar !== user?.avatar) {
        await api.patch('/users/update/avatar', { avatarUrl: formData.avatar });
        updatedUserData.avatar = formData.avatar;
      }

      // 3. Update Cover Image if changed via click
      if (formData.coverImage && formData.coverImage !== user?.coverImage) {
        await api.patch('/users/update/cover-image', { coverImageUrl: formData.coverImage });
        updatedUserData.coverImage = formData.coverImage;
      }

      // Merge all updated fields into Auth context
      const fullUpdatedUser = {
        ...user,
        fullName: formData.fullName,
        username: formData.username,
        email: formData.email,
        description: formData.description,
        githubLink: formData.githubLink,
        avatar: formData.avatar,
        coverImage: formData.coverImage,
        ...updatedUserData,
      };

      if (setUser) {
        setUser(fullUpdatedUser);
      }
      if (onProfileUpdated) {
        onProfileUpdated(fullUpdatedUser);
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
      <div className="bg-[#000000] border border-[#2f3336] rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-fade-in relative flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2f3336] shrink-0">
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

        {/* Modal Scrollable Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-1">
          
          {/* Interactive Cover Image Banner (Changes on Click) */}
          <div className="relative group rounded-2xl overflow-hidden h-36 bg-[#16181c] border border-[#2f3336] flex items-center justify-center">
            {formData.coverImage ? (
              <img
                src={formData.coverImage}
                alt="cover banner"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-linear-to-r from-[#1d9bf0]/30 via-[#7928ca]/25 to-[#00d2ff]/30"></div>
            )}
            
            {/* Click Overlay */}
            <button
              type="button"
              onClick={handleCoverClick}
              className="absolute inset-0 bg-black/50 opacity-80 group-hover:opacity-100 flex items-center justify-center gap-2 text-white font-semibold transition-all cursor-pointer"
              title="Click to change cover image"
            >
              <Camera className="w-6 h-6 text-white" />
              <span className="text-xs bg-black/60 px-3 py-1.5 rounded-full border border-white/20">Click to change cover</span>
            </button>
          </div>

          {/* Interactive Avatar (Changes on Click) */}
          <div className="-mt-14 pl-2 flex items-end justify-between">
            <div className="relative group w-24 h-24 rounded-full overflow-hidden border-4 border-black bg-[#16181c]">
              <img
                src={getAvatarUrl(formData.avatar)}
                alt="avatar"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={handleAvatarClick}
                className="absolute inset-0 bg-black/50 opacity-80 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-all cursor-pointer"
                title="Click to change avatar"
              >
                <Camera className="w-5 h-5 text-white" />
              </button>
            </div>
            <span className="text-xs text-gray-500 pb-2">Click images to update photo</span>
          </div>

          {/* Popover / Input dialog for Avatar URL when avatar clicked */}
          {showAvatarPicker && (
            <div className="p-4 bg-[#16181c] border border-[#1d9bf0]/50 rounded-2xl space-y-3 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#1d9bf0] flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4" /> Change Avatar URL
                </span>
                <button
                  type="button"
                  onClick={() => setShowAvatarPicker(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <input
                type="text"
                name="avatar"
                value={formData.avatar}
                onChange={handleChange}
                placeholder="Enter avatar image URL (e.g. https://example.com/avatar.jpg)"
                className="cwitter-input px-4! py-2.5! text-xs!"
              />
            </div>
          )}

          {/* Popover / Input dialog for Cover URL when cover clicked */}
          {showCoverPicker && (
            <div className="p-4 bg-[#16181c] border border-[#1d9bf0]/50 rounded-2xl space-y-3 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#1d9bf0] flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4" /> Change Cover Image URL
                </span>
                <button
                  type="button"
                  onClick={() => setShowCoverPicker(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <input
                type="text"
                name="coverImage"
                value={formData.coverImage}
                onChange={handleChange}
                placeholder="Enter cover image URL (e.g. https://example.com/cover.jpg)"
                className="cwitter-input px-4! py-2.5! text-xs!"
              />
            </div>
          )}

          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider pl-1 flex items-center gap-1.5">
              <UserIcon className="w-3.5 h-3.5 text-gray-400" /> Full Name
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Full Name"
              required
              className="cwitter-input px-4! py-3! text-sm!"
            />
          </div>

          {/* Username */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider pl-1 flex items-center gap-1.5">
              <AtSign className="w-3.5 h-3.5 text-gray-400" /> Username
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
                className="cwitter-input pl-9! pr-4! py-3! text-sm!"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider pl-1 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-gray-400" /> Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="email@example.com"
              required
              className="cwitter-input px-4! py-3! text-sm!"
            />
          </div>

          {/* Location / Country */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider pl-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-gray-400" /> Location / Country
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Location e.g. India, United States"
              className="cwitter-input px-4! py-3! text-sm!"
            />
          </div>

          {/* Description / Bio */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center pl-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-gray-400" /> Description / Bio
              </label>
              <span className="text-[11px] text-gray-500">{formData.description.length}/160</span>
            </div>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              maxLength={160}
              rows={3}
              placeholder="Tell the world about yourself..."
              className="cwitter-input px-4! py-3! text-sm! resize-none"
            ></textarea>
          </div>

          {/* GitHub Link */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider pl-1 flex items-center gap-1.5">
              <GithubIcon className="w-3.5 h-3.5 text-gray-400" /> GitHub Link
            </label>
            <input
              type="url"
              name="githubLink"
              value={formData.githubLink}
              onChange={handleChange}
              placeholder="https://github.com/yourusername"
              className="cwitter-input px-4! py-3! text-sm!"
            />
          </div>

        </form>

      </div>
    </div>
  );
};

export default EditProfileModal;
