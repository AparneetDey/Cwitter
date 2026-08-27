import React, { useState, useEffect, useRef } from 'react';
import { X, Pencil, Loader2 } from 'lucide-react';
import { usePost } from '../../context/PostContext';
import { getAvatarUrl } from '../../utils/constants';

const EditPostModal = ({ isOpen, onClose, post, setPosts, showToast }) => {
  const { editPost } = usePost();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (isOpen && post) {
      setContent(post.content || '');
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  }, [isOpen, post]);

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

  if (!isOpen || !post) return null;

  const postId = post._id || post.id;
  const maxChars = 280;
  const remainingChars = maxChars - content.length;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() || loading) return;

    setLoading(true);
    try {
      await editPost(postId, content.trim(), setPosts, showToast);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-[#242d34]/60 backdrop-blur-xs flex items-start justify-center pt-16 sm:pt-20 px-4 animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-black border border-[#2f3336] rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col animate-scale-up"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#2f3336]/60">
          <div className="flex items-center space-x-2">
            <Pencil className="w-4 h-4 text-[#1d9bf0]" />
            <span className="text-sm font-bold text-white">Edit Post</span>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1.5 rounded-full hover:bg-[#181818] text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 flex gap-4">
          <img
            src={getAvatarUrl(post?.owner?.avatar || post?.author?.avatar)}
            alt="avatar"
            className="w-11 h-11 rounded-full object-cover shrink-0 bg-[#16181c] border border-[#2f3336]"
          />

          <div className="flex-1 flex flex-col">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows="4"
              maxLength={maxChars}
              placeholder="What is happening?!"
              className="w-full bg-transparent text-white placeholder-gray-500 text-base resize-none focus:outline-none leading-relaxed"
            ></textarea>

            {/* Modal Actions Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-[#2f3336]/60 mt-2">
              <span className={`text-xs ${remainingChars < 20 ? 'text-red-400 font-bold' : 'text-gray-500'}`}>
                {remainingChars}
              </span>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-1.5 rounded-full border border-[#2f3336] text-white font-bold text-xs hover:bg-[#181818] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!content.trim() || loading || content.trim() === post.content}
                  className="bg-[#1d9bf0] hover:bg-[#1a8cd8] text-white font-bold px-5 py-1.5 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-xs flex items-center space-x-1.5 shadow-lg shadow-[#1d9bf0]/20"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save</span>
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

export default EditPostModal;
