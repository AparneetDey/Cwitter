import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usePost } from '../../context/PostContext';
import { getAvatarUrl } from '../../utils/constants';
import {
  Image as ImageIcon,
  Smile,
  BarChart2,
  Calendar,
  MapPin,
  ShieldAlert
} from 'lucide-react';

const PostComposer = ({ onPostCreate }) => {
  const { user } = useAuth();
  const { openVerificationModal } = usePost();
  const [postText, setPostText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!postText.trim()) return;

    onPostCreate(postText.trim());
    setPostText('');
  };

  return (
    <div className="p-4 border-b border-[#2f3336] flex gap-4">
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

        <div className="flex items-center justify-between pt-2 border-t border-[#2f3336]/60">
          {/* Media Icons */}
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

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!postText.trim()}
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
