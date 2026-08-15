import React, { useState, useRef } from 'react';
import { X, Camera, Loader2, AlertCircle, Mail, User as UserIcon, AtSign, FileText, Image as ImageIcon, MapPin, Upload } from 'lucide-react';
import api from '../../utils/axiosApi.util';
import { useAuth } from '../../context/AuthContext';
import { getAvatarUrl } from '../../utils/constants';
import uploadToImageKit from '../../utils/imageKit';

const GithubIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

const EditProfileModal = ({ isOpen, onClose, user, onProfileUpdated }) => {
  const { setUser } = useAuth();

  const avatarInputRef = useRef(null);
  const coverInputRef = useRef(null);

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

  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarProgress, setAvatarProgress] = useState(0);

  const [uploadingCover, setUploadingCover] = useState(false);
  const [coverProgress, setCoverProgress] = useState(0);

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

  // Avatar file upload handler -> Uploads to ImageKit
  const handleAvatarFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setUploadingAvatar(true);
    setAvatarProgress(0);

    try {
      const res = await uploadToImageKit(file, (progress) => {
        setAvatarProgress(progress);
      });

      if (res?.url) {
        setFormData((prev) => ({ ...prev, avatar: res.url }));
      }
    } catch (err) {
      console.warn("ImageKit upload failed, falling back to local file preview:", err);
      // Fallback preview
      const reader = new FileReader();
      reader.onload = () => {
        setFormData((prev) => ({ ...prev, avatar: reader.result }));
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Cover image file upload handler -> Uploads to ImageKit
  const handleCoverFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setUploadingCover(true);
    setCoverProgress(0);

    try {
      const res = await uploadToImageKit(file, (progress) => {
        setCoverProgress(progress);
      });

      if (res?.url) {
        setFormData((prev) => ({ ...prev, coverImage: res.url }));
      }
    } catch (err) {
      console.warn("ImageKit upload failed, falling back to local file preview:", err);
      // Fallback preview
      const reader = new FileReader();
      reader.onload = () => {
        setFormData((prev) => ({ ...prev, coverImage: reader.result }));
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingCover(false);
    }
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

      // 2. Update Avatar URL if changed
      if (formData.avatar && formData.avatar !== user?.avatar) {
        await api.patch('/users/update/avatar', { avatarUrl: formData.avatar });
        updatedUserData.avatar = formData.avatar;
      }

      // 3. Update Cover Image URL if changed
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
        location: formData.location,
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
        onProfileUpdated();
      }

      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-white/10 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      
      {/* Hidden File Input Elements */}
      <input
        type="file"
        ref={avatarInputRef}
        onChange={handleAvatarFileSelect}
        accept="image/*"
        className="hidden"
      />
      <input
        type="file"
        ref={coverInputRef}
        onChange={handleCoverFileSelect}
        accept="image/*"
        className="hidden"
      />

      <div className="bg-[#000000] border border-[#2f3336] rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl animate-fade-in relative">
        
        {/* Header Bar */}
        <div className="sticky top-0 bg-black/90 backdrop-blur-md z-20 px-6 py-4 border-b border-[#2f3336] flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onClose}
              type="button"
              className="p-2 rounded-full hover:bg-[#181818] text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-bold text-xl text-white">Edit profile</h3>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || uploadingAvatar || uploadingCover}
            className="cwitter-btn-secondary !w-auto !py-1.5 !px-5"
          >
            {loading ? (
              <span className="flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin text-black" />
                <span>Saving...</span>
              </span>
            ) : (
              <span>Save</span>
            )}
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-6">

          {/* Error Alert */}
          {error && (
            <div className="p-4 bg-red-950/60 border border-red-800/80 rounded-2xl flex items-center space-x-3 text-red-200 text-sm">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Interactive Cover Banner */}
          <div className="relative h-44 sm:h-48 bg-[#16181c] rounded-2xl overflow-hidden group border border-[#2f3336]">
            {formData.coverImage ? (
              <img
                src={formData.coverImage}
                alt="cover"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-[#1d9bf0]/30 via-[#7928ca]/20 to-[#00d2ff]/30 flex items-center justify-center">
                <span className="text-gray-500 text-xs font-semibold">No Cover Image</span>
              </div>
            )}

            {/* Uploading Progress Overlay */}
            {uploadingCover ? (
              <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white space-y-2">
                <Loader2 className="w-6 h-6 animate-spin text-[#1d9bf0]" />
                <span className="text-xs font-semibold">Uploading to ImageKit ({coverProgress}%)</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                className="absolute inset-0 bg-black/40 opacity-80 group-hover:opacity-100 flex items-center justify-center text-white transition-all cursor-pointer"
                title="Upload cover image file"
              >
                <div className="p-3 bg-black/60 rounded-full hover:bg-black/80 transition-colors flex items-center space-x-2">
                  <Camera className="w-5 h-5 text-white" />
                  <span className="text-xs font-semibold">Upload Cover</span>
                </div>
              </button>
            )}
          </div>

          {/* Interactive Avatar */}
          <div className="-mt-16 pl-4 flex items-end justify-between relative z-10">
            <div className="relative group w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 border-black bg-[#16181c]">
              <img
                src={getAvatarUrl(formData.avatar)}
                alt="avatar"
                className="w-full h-full object-cover"
              />

              {uploadingAvatar ? (
                <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-white p-1">
                  <Loader2 className="w-5 h-5 animate-spin text-[#1d9bf0]" />
                  <span className="text-[10px] font-bold mt-1">{avatarProgress}%</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  className="absolute inset-0 bg-black/50 opacity-80 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-all cursor-pointer"
                  title="Upload avatar image file"
                >
                  <Camera className="w-6 h-6 text-white" />
                  <span className="text-[10px] font-semibold mt-1">Photo</span>
                </button>
              )}
            </div>
            <span className="text-xs text-gray-500 pb-2">Click camera icons to upload images</span>
          </div>

          {/* Form Input Fields */}
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider pl-1 flex items-center gap-1.5">
                <UserIcon className="w-3.5 h-3.5 text-gray-400" /> Full Name
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
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider pl-1 flex items-center gap-1.5">
                <AtSign className="w-3.5 h-3.5 text-gray-400" /> Username
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-4 text-gray-500 text-sm">@</span>
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

            {/* Email */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider pl-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-gray-400" /> Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="email@example.com"
                required
                className="cwitter-input !px-4 !py-3 !text-sm"
              />
            </div>

            {/* Location / Country */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider pl-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-gray-400" /> Location / Country
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Location e.g. India, United States"
                className="cwitter-input !px-4 !py-3 !text-sm"
              />
            </div>

            {/* Description / Bio */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center pl-1">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
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
                className="cwitter-input !px-4 !py-3 !text-sm resize-none"
              ></textarea>
            </div>

            {/* GitHub Link */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider pl-1 flex items-center gap-1.5">
                <GithubIcon className="w-3.5 h-3.5 text-gray-400" /> GitHub Profile Link
              </label>
              <input
                type="text"
                name="githubLink"
                value={formData.githubLink}
                onChange={handleChange}
                placeholder="github.com/username"
                className="cwitter-input !px-4 !py-3 !text-sm"
              />
            </div>

          </form>

        </div>

      </div>
    </div>
  );
};

export default EditProfileModal;
