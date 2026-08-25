import React from 'react';
import { useOutletContext } from 'react-router';
import { getAvatarUrl } from '../../utils/constants';
import { usePost } from '../../context/PostContext';
import {
  Heart,
  Repeat2,
  MessageCircle,
  Share,
  Bookmark,
  BarChart2,
  CheckCircle2,
  MoreHorizontal
} from 'lucide-react';
import useFormatter from '../../hooks/useFormatter';

const PostItem = ({ post, setPosts, onBookmarkToggle }) => {
  const { toggleLike, toggleRetweet, toggleBookmark, sharePost } = usePost();
  const { showToast } = useOutletContext() || {};
  const { formatNumber, formatTimeAgo } = useFormatter();

  const postId = post?._id || post?.id;

  const handleLikeClick = (e) => {
    e.stopPropagation();
    toggleLike(postId, setPosts);
  };

  const handleRetweetClick = (e) => {
    e.stopPropagation();
    toggleRetweet(postId, setPosts, showToast);
  };

  const handleBookmarkClick = (e) => {
    e.stopPropagation();
    if (onBookmarkToggle) {
      onBookmarkToggle(postId);
    } else {
      toggleBookmark(postId, setPosts, showToast);
    }
  };

  const handleShareClick = (e) => {
    e.stopPropagation();
    sharePost(postId, showToast);
  };

  return (
    <article className="p-4 hover:bg-[#080808] transition-colors flex gap-3.5 cursor-pointer">
      {/* Owner Avatar */}
      <img
        src={getAvatarUrl(post?.owner?.avatar || post?.author?.avatar)}
        alt={post?.owner?.fullName || post?.author?.fullName}
        className="w-11 h-11 rounded-full object-cover shrink-0 bg-[#16181c]"
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col gap-2">
        
        {/* Owner Meta Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5 text-sm">
            <span className="font-bold text-white hover:underline">
              {post?.owner?.fullName || post?.author?.fullName}
            </span>
            {(post?.owner?.isVerified || post?.author?.verified) && (
              <CheckCircle2 className="w-4 h-4 text-[#1d9bf0]" />
            )}
            <span className="text-gray-500">
              @{post?.owner?.username || post?.author?.username}
            </span>
            <span className="text-gray-500">·</span>
            <span className="text-gray-500">
              {formatTimeAgo(post?.createdAt)}
            </span>
          </div>
          <MoreHorizontal className="w-4 h-4 text-gray-500 hover:text-white" />
        </div>

        {/* Post Text */}
        <p className="text-[#e7e9ea] text-[15px] leading-normal whitespace-pre-line">
          {post?.content}
        </p>

        {/* Post Image Attachment */}
        {post?.image && (
          <div className="mt-2 rounded-2xl overflow-hidden border border-[#2f3336] max-h-96">
            <img src={post?.image} alt="post media" className="w-full h-full object-cover" />
          </div>
        )}

        {/* Action Buttons Row */}
        <div className="flex items-center justify-between text-gray-500 max-w-md pt-2 text-xs">
          
          {/* Reply */}
          <button className="flex items-center space-x-2 hover:text-[#1d9bf0] group transition-colors cursor-pointer">
            <div className="p-2 rounded-full group-hover:bg-[#1d9bf0]/10">
              <MessageCircle className="w-4 h-4" />
            </div>
            <span>{post?.replies || 0}</span>
          </button>

          {/* Retweet */}
          <button
            onClick={handleRetweetClick}
            className={`flex items-center space-x-2 group transition-colors cursor-pointer ${
              post?.isRetweeted ? 'text-emerald-500 font-semibold' : 'hover:text-emerald-500'
            }`}
          >
            <div className="p-2 rounded-full group-hover:bg-emerald-500/10">
              <Repeat2 className="w-4 h-4" />
            </div>
            <span>{formatNumber(post?.retweets || post?.totalRetweets || 0)}</span>
          </button>

          {/* Like */}
          <button
            onClick={handleLikeClick}
            className={`flex items-center space-x-2 group transition-colors cursor-pointer ${
              post?.isLiked ? 'text-rose-500 font-semibold' : 'hover:text-rose-500'
            }`}
          >
            <div className="p-2 rounded-full group-hover:bg-rose-500/10">
              <Heart className={`w-4 h-4 ${post?.isLiked ? 'fill-current text-rose-500' : ''}`} />
            </div>
            <span>{formatNumber(post?.likes || 0)}</span>
          </button>

          {/* Views */}
          <div className="flex items-center space-x-2">
            <div className="p-2">
              <BarChart2 className="w-4 h-4" />
            </div>
            <span>{post?.views || '100'}</span>
          </div>

          {/* Bookmark & Share */}
          <div className="flex items-center space-x-1">
            <button
              onClick={handleBookmarkClick}
              className={`p-2 rounded-full hover:bg-[#1d9bf0]/10 cursor-pointer ${
                post?.isBookmarked ? 'text-[#1d9bf0]' : 'hover:text-[#1d9bf0]'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${post?.isBookmarked ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={handleShareClick}
              className="p-2 rounded-full hover:bg-[#1d9bf0]/10 hover:text-[#1d9bf0] cursor-pointer"
            >
              <Share className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>
    </article>
  );
};

export default PostItem;
