import React, { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router';
import { X, Image as ImageIcon, Smile, BarChart2, Calendar, MapPin, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePost } from '../../context/PostContext';
import { getAvatarUrl } from '../../utils/constants';
import uploadToImageKit from '../../utils/imageKit';

const PostCreateModal = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { createPost } = usePost();
  const { showToast } = useOutletContext() || {};
  const mediaInputRef = useRef(null);
  const textareaRef = useRef(null);

  const [postText, setPostText] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loading, setLoading] = useState(false);

  // Focus textarea when modal opens & reset text/media
  useEffect(() => {
    if (isOpen) {
      setPostText('');
      setMediaUrl('');
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if ((!postText.trim() && !mediaUrl) || loading || uploading) return;

    setLoading(true);
    try {
      const mediaList = mediaUrl ? [mediaUrl] : [];
      await createPost(postText.trim(), mediaList, showToast);
      setPostText('');
      setMediaUrl('');
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const maxChars = 280;
  const remainingChars = maxChars - postText.length;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-[#242d34]/60 backdrop-blur-xs z-50 flex items-start justify-center pt-16 sm:pt-20 px-4 animate-fade-in"
    >
      {/* Hidden File Input for Media Upload */}
      <input
        type="file"
        ref={mediaInputRef}
        onChange={handleMediaSelect}
        accept="image/*,video/*"
        className="hidden"
      />

      {/* Modal Container */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-black border border-[#2f3336] rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col animate-scale-up"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#2f3336]/60">
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[#181818] text-white transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
          <span className="text-sm font-bold text-gray-400">Drafts</span>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-4 flex gap-4">
          <img
            src={getAvatarUrl(user?.avatar)}
            alt="avatar"
            className="w-11 h-11 rounded-full object-cover shrink-0 bg-[#16181c] border border-[#2f3336]"
          />

          <div className="flex-1 flex flex-col">
            <textarea
              ref={textareaRef}
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
              placeholder="What is happening?!"
              rows="4"
              maxLength={maxChars}
              className="w-full bg-transparent text-white placeholder-gray-500 text-lg resize-none focus:outline-none leading-relaxed"
            ></textarea>

            {/* Media Upload Progress / Preview */}
            {uploading ? (
              <div className="p-3 bg-[#16181c] rounded-2xl border border-[#2f3336] flex items-center space-x-3 text-xs text-gray-300 my-2">
                <Loader2 className="w-4 h-4 animate-spin text-[#1d9bf0]" />
                <span>Uploading media to ImageKit ({uploadProgress}%)...</span>
              </div>
            ) : mediaUrl ? (
              <div className="relative rounded-2xl overflow-hidden border border-[#2f3336] max-h-72 my-2 group">
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

            {/* Modal Footer / Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-[#2f3336]/60 mt-2">
              {/* Media Tool Icons */}
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

              {/* Character Counter & Submit Button */}
              <div className="flex items-center space-x-3">
                {postText.length > 0 && (
                  <span className={`text-xs ${remainingChars < 20 ? 'text-red-400 font-bold' : 'text-gray-500'}`}>
                    {remainingChars}
                  </span>
                )}

                <button
                  type="submit"
                  disabled={(!postText.trim() && !mediaUrl) || loading || uploading}
                  className="bg-[#1d9bf0] hover:bg-[#1a8cd8] text-white font-bold px-5 py-2 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-sm flex items-center space-x-1.5 shadow-lg shadow-[#1d9bf0]/20"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Posting...</span>
                    </>
                  ) : (
                    <span>Post</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostCreateModal;
