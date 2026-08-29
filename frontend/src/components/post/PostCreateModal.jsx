import React, { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router';
import { X, Image as ImageIcon, Smile, BarChart2, Calendar, MapPin, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePost } from '../../context/PostContext';
import { getAvatarUrl } from '../../utils/constants';

const PostCreateModal = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { createPost } = usePost();
  const { showToast } = useOutletContext() || {};
  const mediaInputRef = useRef(null);
  const textareaRef = useRef(null);

  const [postText, setPostText] = useState('');
  const [selectedMedia, setSelectedMedia] = useState([]); // Array of { file, previewUrl }
  const [loading, setLoading] = useState(false);

  // Focus textarea when modal opens & reset text/media
  useEffect(() => {
    if (isOpen) {
      setPostText('');
      setSelectedMedia([]);
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

  const handleMediaSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const availableSlots = 3 - selectedMedia.length;
    if (availableSlots <= 0) return;

    const filesToAdd = files.slice(0, availableSlots);
    const newItems = filesToAdd.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
      type: file.type
    }));

    setSelectedMedia((prev) => [...prev, ...newItems].slice(0, 3));
    if (mediaInputRef.current) mediaInputRef.current.value = '';
  };

  const handleRemoveMedia = (indexToRemove) => {
    setSelectedMedia((prev) => {
      const item = prev[indexToRemove];
      if (item?.previewUrl) {
        URL.revokeObjectURL(item.previewUrl);
      }
      return prev.filter((_, idx) => idx !== indexToRemove);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if ((!postText.trim() && selectedMedia.length === 0) || loading) return;

    setLoading(true);
    try {
      const rawFiles = selectedMedia.map((item) => item.file);
      await createPost(postText.trim(), rawFiles, showToast);
      setPostText('');
      setSelectedMedia([]);
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
      {/* Hidden File Input for Local Media Selection */}
      <input
        type="file"
        ref={mediaInputRef}
        onChange={handleMediaSelect}
        accept="image/*,video/*"
        multiple
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

            {/* Local Instant Media Preview Carousel (Scrollable, Full Size) */}
            {selectedMedia.length > 0 && (
              <div className="relative rounded-2xl overflow-hidden border border-[#2f3336] my-2">
                <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none max-h-72">
                  {selectedMedia.map((item, idx) => (
                    <div key={idx} className="w-full shrink-0 snap-start relative max-h-72 flex items-center justify-center bg-black group">
                      {item.type?.startsWith('video/') || item.previewUrl.match(/\.(mp4|webm|mov)$/i) ? (
                        <video src={item.previewUrl} controls className="w-full h-full object-cover max-h-72" />
                      ) : (
                        <img src={item.previewUrl} alt={`media attachment ${idx + 1}`} className="w-full h-full object-cover max-h-72" />
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveMedia(idx)}
                        className="absolute top-2 right-2 p-1.5 bg-black/75 hover:bg-black rounded-full text-white transition-colors cursor-pointer z-10"
                        title="Remove media"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Modal Footer / Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-[#2f3336]/60 mt-2">
              {/* Media Tool Icons */}
              <div className="flex items-center gap-1 text-[#1d9bf0]">
                <button
                  type="button"
                  onClick={() => mediaInputRef.current?.click()}
                  disabled={selectedMedia.length >= 3 || loading}
                  className="p-2 hover:bg-[#1d9bf0]/10 rounded-full transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-1"
                  title={selectedMedia.length >= 3 ? "Maximum 3 media files reached" : "Attach photos or videos (up to 3)"}
                >
                  <ImageIcon className="w-5 h-5" />
                  {selectedMedia.length > 0 && (
                    <span className="text-xs font-bold text-[#1d9bf0]">{selectedMedia.length}/3</span>
                  )}
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
                  disabled={(!postText.trim() && selectedMedia.length === 0) || loading}
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
