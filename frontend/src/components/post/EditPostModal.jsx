import React, { useState, useEffect, useRef } from 'react';
import { X, Pencil, Loader2, Image as ImageIcon, Smile, ChevronLeft, ChevronRight } from 'lucide-react';
import { usePost } from '../../context/PostContext';
import { getAvatarUrl } from '../../utils/constants';
import EmojiPickerPopover from '../common/EmojiPickerPopover';

const MediaImageWithSkeleton = ({ url, alt, maxH = "max-h-72" }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const isVideo = url?.match(/\.(mp4|webm|mov)$/i);

  return (
    <div className={`relative w-full h-full flex items-center justify-center bg-[#16181c] overflow-hidden ${maxH}`}>
      {/* Skeleton Pulse Placeholder */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-r from-[#16181c] via-[#242830] to-[#16181c] animate-pulse flex flex-col items-center justify-center space-y-2 z-0">
          <ImageIcon className="w-8 h-8 text-gray-600 animate-bounce" />
          <span className="text-xs font-semibold text-gray-500">Loading media...</span>
        </div>
      )}

      {isVideo ? (
        <video
          src={url}
          controls
          onLoadedData={() => setIsLoaded(true)}
          className={`w-full h-full object-cover relative z-0 ${maxH} transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ) : (
        <img
          src={url}
          alt={alt || "post media"}
          onLoad={() => setIsLoaded(true)}
          className={`w-full h-full object-cover relative z-0 ${maxH} transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}
    </div>
  );
};

const EditPostModal = ({ isOpen, onClose, post, showToast }) => {
  const { editPost } = usePost();
  const mediaInputRef = useRef(null);
  const textareaRef = useRef(null);
  const carouselScrollRef = useRef(null);
  const emojiButtonRef = useRef(null);

  const [content, setContent] = useState('');
  const [mediaItems, setMediaItems] = useState([]); // Array of { id, url, file, previewUrl, isExisting, isNew, type }
  const [removedUrls, setRemovedUrls] = useState([]); // Array of removed URL strings
  const [activeIndex, setActiveIndex] = useState(0);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && post) {
      setContent(post.content || '');
      setRemovedUrls([]);
      setActiveIndex(0);
      setShowEmojiPicker(false);

      // Initialize media items from post.media array or post.image fallback
      const initialMedia = Array.isArray(post.media) && post.media.length > 0
        ? post.media.map((url, idx) => ({ id: `existing-${idx}`, url, isExisting: true }))
        : post.image
          ? [{ id: 'existing-0', url: post.image, isExisting: true }]
          : [];

      setMediaItems(initialMedia);

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

  const handleScroll = () => {
    if (!carouselScrollRef.current) return;
    const { scrollLeft, clientWidth } = carouselScrollRef.current;
    if (clientWidth > 0) {
      const index = Math.round((scrollLeft + 10) / clientWidth);
      setActiveIndex(index);
    }
  };

  const scrollCarousel = (direction, e) => {
    e?.stopPropagation();
    e?.preventDefault();
    if (!carouselScrollRef.current) return;
    const { clientWidth } = carouselScrollRef.current;
    const scrollAmount = direction === 'left' ? -clientWidth : clientWidth;
    carouselScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  const handleMediaSelect = (e) => {
    e.stopPropagation();
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const availableSlots = 3 - mediaItems.length;
    if (availableSlots <= 0) return;

    const filesToAdd = files.slice(0, availableSlots);
    const newItems = filesToAdd.map((file) => ({
      id: `new-${Date.now()}-${Math.random()}`,
      file,
      previewUrl: URL.createObjectURL(file),
      type: file.type,
      isNew: true
    }));

    setMediaItems((prev) => [...prev, ...newItems].slice(0, 3));
    if (mediaInputRef.current) mediaInputRef.current.value = '';
  };

  const handleRemoveMedia = (indexToRemove) => {
    setMediaItems((prev) => {
      const item = prev[indexToRemove];
      if (item?.isExisting && item?.url) {
        setRemovedUrls((prevRemoved) => [...prevRemoved, item.url]);
      }
      if (item?.previewUrl) {
        URL.revokeObjectURL(item.previewUrl);
      }
      return prev.filter((_, idx) => idx !== indexToRemove);
    });
    setActiveIndex((prev) => Math.max(0, prev - 1));
  };

  const handleEmojiClick = (emojiData) => {
    setContent((prev) => prev + emojiData.emoji);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if ((!content.trim() && mediaItems.length === 0) || loading) return;

    setLoading(true);
    try {
      await editPost(postId, content.trim(), mediaItems, removedUrls, showToast);
      setShowEmojiPicker(false);
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
        {/* Hidden File Input for Adding Media */}
        <input
          type="file"
          ref={mediaInputRef}
          onChange={handleMediaSelect}
          onClick={(e) => e.stopPropagation()}
          accept="image/*,video/*"
          multiple
          className="hidden"
        />

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

            {/* Media Items Carousel with Navigation Arrows in Edit Mode */}
            {mediaItems.length > 0 && (
              <div className="relative rounded-2xl overflow-hidden border border-[#2f3336] my-2 group/carousel">
                <div
                  ref={carouselScrollRef}
                  onScroll={handleScroll}
                  className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none max-h-72"
                >
                  {mediaItems.map((item, idx) => {
                    const displayUrl = item.url || item.previewUrl;

                    return (
                      <div key={item.id || idx} className="w-full min-w-full shrink-0 snap-start relative max-h-72 flex items-center justify-center bg-black group">
                        <MediaImageWithSkeleton url={displayUrl} alt={`media item ${idx + 1}`} maxH="max-h-72" />
                        <button
                          type="button"
                          onClick={() => handleRemoveMedia(idx)}
                          className="absolute top-2.5 right-2.5 p-1.5 bg-black/80 hover:bg-black rounded-full text-white transition-colors cursor-pointer z-20 shadow-md"
                          title="Remove media item"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Navigation Arrows & Counter Badge */}
                {mediaItems.length > 1 && (
                  <>
                    {/* Left Arrow */}
                    {activeIndex > 0 && (
                      <button
                        type="button"
                        onClick={(e) => scrollCarousel('left', e)}
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/75 hover:bg-black text-white transition-all shadow-lg cursor-pointer z-30 hover:scale-105"
                        title="Previous media"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                    )}

                    {/* Right Arrow */}
                    {activeIndex < mediaItems.length - 1 && (
                      <button
                        type="button"
                        onClick={(e) => scrollCarousel('right', e)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/75 hover:bg-black text-white transition-all shadow-lg cursor-pointer z-30 hover:scale-105"
                        title="Next media"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    )}

                    {/* Page Counter Badge */}
                    <div className="absolute top-2.5 left-2.5 bg-black/75 backdrop-blur-xs px-2.5 py-0.5 rounded-full text-xs font-semibold text-white pointer-events-none z-30">
                      {activeIndex + 1} / {mediaItems.length}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Modal Actions Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-[#2f3336]/60 mt-2">
              <div className="flex items-center space-x-1 text-[#1d9bf0]">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    mediaInputRef.current?.click();
                  }}
                  disabled={mediaItems.length >= 3 || loading}
                  className="p-2 hover:bg-[#1d9bf0]/10 rounded-full transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-1"
                  title={mediaItems.length >= 3 ? "Maximum 3 media items reached" : "Add photo or video (up to 3)"}
                >
                  <ImageIcon className="w-5 h-5" />
                  {mediaItems.length > 0 && (
                    <span className="text-xs font-bold text-[#1d9bf0]">{mediaItems.length}/3</span>
                  )}
                </button>

                {/* Emoji Picker Button */}
                <button
                  ref={emojiButtonRef}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowEmojiPicker((prev) => !prev);
                  }}
                  className={`p-2 rounded-full transition-colors cursor-pointer ${
                    showEmojiPicker ? 'bg-[#1d9bf0]/20 text-[#1d9bf0]' : 'hover:bg-[#1d9bf0]/10 text-[#1d9bf0]'
                  }`}
                  title="Add emoji"
                >
                  <Smile className="w-5 h-5" />
                </button>

                {/* Floating Portal Emoji Picker (Renders outside modal container to avoid overflow clipping) */}
                <EmojiPickerPopover
                  isOpen={showEmojiPicker}
                  onClose={() => setShowEmojiPicker(false)}
                  onEmojiClick={handleEmojiClick}
                  triggerRef={emojiButtonRef}
                />

                <span className={`text-xs ml-2 ${remainingChars < 20 ? 'text-red-400 font-bold' : 'text-gray-500'}`}>
                  {remainingChars}
                </span>
              </div>

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
                  disabled={(!content.trim() && mediaItems.length === 0) || loading}
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
