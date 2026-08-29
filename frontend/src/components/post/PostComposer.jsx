import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usePost } from '../../context/PostContext';
import { getAvatarUrl } from '../../utils/constants';
import uploadToImageKit from '../../utils/imageKit';
import {
  Image as ImageIcon,
  Smile,
  BarChart2,
  Calendar,
  MapPin,
  ShieldAlert,
  X,
  Loader2
} from 'lucide-react';

const PostComposer = ({ onPostCreate }) => {
  const { user } = useAuth();
  const { openVerificationModal } = usePost();
  const mediaInputRef = useRef(null);

  const [postText, setPostText] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleMediaSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const res = await uploadToImageKit(file, (progress) => {
        setUploadProgress(progress);
      });
      if (res?.url) {
        setMediaUrl(res.url);
      }
    } catch (err) {
      console.warn('ImageKit media upload error, using local preview fallback:', err);
      const reader = new FileReader();
      reader.onload = () => {
        setMediaUrl(reader.result);
      };
      reader.readAsDataURL(file);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!postText.trim() && !mediaUrl) return;

    const mediaList = mediaUrl ? [mediaUrl] : [];
    onPostCreate(postText.trim(), mediaList);
    setPostText('');
    setMediaUrl('');
  };

  return (
    <div className="p-4 border-b border-[#2f3336] flex gap-4">
      {/* Hidden File Input for Media Upload */}
      <input
        type="file"
        ref={mediaInputRef}
        onChange={handleMediaSelect}
        accept="image/*,video/*"
        className="hidden"
      />

      <img
        src={getAvatarUrl(user?.avatar)}
        alt="avatar"
        className="w-11 h-11 rounded-full object-cover shrink-0 bg-[#16181c]"
      />

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-3">
        {/* Verification Warning Notice for Unverified Accounts */}
        {!user?.isVerified && (
          <div className="p-2.5 bg-[#1d9bf0]/10 border border-[#1d9bf0]/30 rounded-xl flex items-center justify-between text-xs text-[#1d9bf0]">
            <div className="flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 shrink-0 text-[#1d9bf0]" />
              <span>Verification required to post tweets on Cwitter.</span>
            </div>
            <button
              type="button"
              onClick={openVerificationModal}
              className="font-bold underline hover:text-white transition-colors cursor-pointer shrink-0 ml-2"
            >
              Verify Now &rarr;
            </button>
          </div>
        )}

        <textarea
          value={postText}
          onChange={(e) => setPostText(e.target.value)}
          placeholder={user?.isVerified ? "What is happening?!" : "Verify your account to post on Cwitter..."}
          rows="3"
          className="w-full bg-transparent text-white placeholder-gray-500 text-lg resize-none focus:outline-none"
        ></textarea>

        {/* Media Preview / Upload Progress */}
        {uploading ? (
          <div className="p-4 bg-[#16181c] rounded-2xl border border-[#2f3336] flex items-center space-x-3 text-xs text-gray-300">
            <Loader2 className="w-4 h-4 animate-spin text-[#1d9bf0]" />
            <span>Uploading media to ImageKit ({uploadProgress}%)...</span>
          </div>
        ) : mediaUrl ? (
          <div className="relative rounded-2xl overflow-hidden border border-[#2f3336] max-h-80 group">
            {mediaUrl.match(/\.(mp4|webm|mov)$/i) ? (
              <video src={mediaUrl} controls className="w-full h-full object-cover" />
            ) : (
              <img src={mediaUrl} alt="media attachment" className="w-full h-full object-cover" />
            )}
            <button
              type="button"
              onClick={() => setMediaUrl('')}
              className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-black rounded-full text-white transition-colors cursor-pointer"
              title="Remove media"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : null}

        <div className="flex items-center justify-between pt-2 border-t border-[#2f3336]/60">
          {/* Media Icons */}
          <div className="flex items-center gap-1 text-[#1d9bf0]">
            <button
              type="button"
              onClick={() => mediaInputRef.current?.click()}
              className="p-2 hover:bg-[#1d9bf0]/10 rounded-full transition-colors cursor-pointer"
              title="Attach photo or video"
            >
              <ImageIcon className="w-5 h-5" />
            </button>
            <button type="button" className="p-2 hover:bg-[#1d9bf0]/10 rounded-full transition-colors cursor-pointer" title="Poll">
              <BarChart2 className="w-5 h-5" />
            </button>
            <button type="button" className="p-2 hover:bg-[#1d9bf0]/10 rounded-full transition-colors cursor-pointer" title="Emoji">
              <Smile className="w-5 h-5" />
            </button>
            <button type="button" className="p-2 hover:bg-[#1d9bf0]/10 rounded-full transition-colors cursor-pointer" title="Schedule">
              <Calendar className="w-5 h-5" />
            </button>
            <button type="button" className="p-2 hover:bg-[#1d9bf0]/10 rounded-full transition-colors cursor-pointer opacity-50" title="Location">
              <MapPin className="w-5 h-5" />
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={(!postText.trim() && !mediaUrl) || uploading}
            className="bg-[#1d9bf0] hover:bg-[#1a8cd8] text-white font-bold px-5 py-2 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-sm"
          >
            Post
          </button>
        </div>
      </form>
    </div>
  );
};

export default PostComposer;
