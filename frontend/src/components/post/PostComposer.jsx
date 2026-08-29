import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usePost } from '../../context/PostContext';
import { getAvatarUrl } from '../../utils/constants';
import EmojiPickerPopover from '../common/EmojiPickerPopover';
import {
  Image as ImageIcon,
  Smile,
  BarChart2,
  Calendar,
  MapPin,
  ShieldAlert,
  X
} from 'lucide-react';

const PostComposer = ({ onPostCreate }) => {
  const { user } = useAuth();
  const { openVerificationModal } = usePost();
  const mediaInputRef = useRef(null);
  const emojiButtonRef = useRef(null);

  const [postText, setPostText] = useState('');
  const [selectedMedia, setSelectedMedia] = useState([]); // Array of { file, previewUrl }
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

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

  const handleEmojiClick = (emojiData) => {
    setPostText((prev) => prev + emojiData.emoji);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!postText.trim() && selectedMedia.length === 0) return;

    const rawFiles = selectedMedia.map((item) => item.file);
    onPostCreate(postText.trim(), rawFiles);

    setPostText('');
    setSelectedMedia([]);
    setShowEmojiPicker(false);
  };

  return (
    <div className="p-4 border-b border-[#2f3336] flex gap-4">
      {/* Hidden File Input for Local Media Selection */}
      <input
        type="file"
        ref={mediaInputRef}
        onChange={handleMediaSelect}
        accept="image/*,video/*"
        multiple
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
          className="w-full bg-transparent text-[#e7e9ea] placeholder-gray-500 text-lg resize-none focus:outline-none"
        ></textarea>

        {/* Local Instant Media Preview Carousel (Scrollable, Full Size) */}
        {selectedMedia.length > 0 && (
          <div className="relative rounded-2xl overflow-hidden border border-[#2f3336] my-1">
            <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none max-h-80">
              {selectedMedia.map((item, idx) => (
                <div key={idx} className="w-full shrink-0 snap-start relative max-h-80 flex items-center justify-center bg-black group">
                  {item.type?.startsWith('video/') || item.previewUrl.match(/\.(mp4|webm|mov)$/i) ? (
                    <video src={item.previewUrl} controls className="w-full h-full object-cover max-h-80" />
                  ) : (
                    <img src={item.previewUrl} alt={`media attachment ${idx + 1}`} className="w-full h-full object-cover max-h-80" />
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

        <div className="flex items-center justify-between pt-2 border-t border-[#2f3336]/60">
          {/* Media Icons */}
          <div className="flex items-center gap-1 text-[#1d9bf0]">
            <button
              type="button"
              onClick={() => mediaInputRef.current?.click()}
              disabled={selectedMedia.length >= 3}
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

            {/* Floating Portal Emoji Picker */}
            <EmojiPickerPopover
              isOpen={showEmojiPicker}
              onClose={() => setShowEmojiPicker(false)}
              onEmojiClick={handleEmojiClick}
              triggerRef={emojiButtonRef}
            />

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
            disabled={!postText.trim() && selectedMedia.length === 0}
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
