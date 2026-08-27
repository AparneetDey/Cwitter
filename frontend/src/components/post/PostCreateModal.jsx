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
  const [postText, setPostText] = useState('');
  const [loading, setLoading] = useState(false);
  const textareaRef = useRef(null);

  // Focus textarea when modal opens & reset text
  useEffect(() => {
    if (isOpen) {
      setPostText('');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!postText.trim() || loading) return;

    setLoading(true);
    try {
      await createPost(postText.trim(), showToast);
      setPostText('');
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
              rows="5"
              maxLength={maxChars}
              className="w-full bg-transparent text-white placeholder-gray-500 text-lg resize-none focus:outline-none leading-relaxed"
            ></textarea>

            {/* Modal Footer / Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-[#2f3336]/60 mt-2">
              {/* Media Tool Icons */}
              <div className="flex items-center gap-1 text-[#1d9bf0]">
                <button type="button" className="p-2 hover:bg-[#1d9bf0]/10 rounded-full transition-colors cursor-pointer" title="Media">
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
                  disabled={!postText.trim() || loading}
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
