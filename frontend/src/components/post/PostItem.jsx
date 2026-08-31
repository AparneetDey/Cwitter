import React, { useState, useRef, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router';
import { getAvatarUrl } from '../../utils/constants';
import { usePost } from '../../context/PostContext';
import { useAuth } from '../../context/AuthContext';
import EditPostModal from './EditPostModal';
import {
  Heart,
  Repeat2,
  MessageCircle,
  Share,
  Bookmark,
  BarChart2,
  CheckCircle2,
  MoreHorizontal,
  Trash2,
  Pencil,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon
} from 'lucide-react';
import useFormatter from '../../hooks/useFormatter';
import usePostReach from '../../hooks/usePostReach';

const MediaImageWithSkeleton = ({ url, alt, maxH = "max-h-96" }) => {
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

const MediaCarousel = ({ media, maxH = "max-h-96" }) => {
  const scrollRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, clientWidth } = scrollRef.current;
    if (clientWidth > 0) {
      const index = Math.round((scrollLeft + 10) / clientWidth);
      setActiveIndex(index);
    }
  };

  const scroll = (direction, e) => {
    e.stopPropagation();
    e.preventDefault();
    if (!scrollRef.current) return;
    const { clientWidth } = scrollRef.current;
    const scrollAmount = direction === 'left' ? -clientWidth : clientWidth;
    scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  if (!Array.isArray(media) || media.length === 0) return null;

  return (
    <div className="mt-2.5 relative rounded-2xl overflow-hidden border border-[#2f3336] group/carousel" onClick={(e) => e.stopPropagation()}>
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className={`flex overflow-x-auto snap-x snap-mandatory scrollbar-none ${maxH}`}
      >
        {media.map((url, idx) => (
          <div key={idx} className={`w-full min-w-full shrink-0 snap-start ${maxH} flex items-center justify-center bg-black`}>
            <MediaImageWithSkeleton url={url} alt={`post media ${idx + 1}`} maxH={maxH} />
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {media.length > 1 && (
        <>
          {/* Left Arrow */}
          {activeIndex > 0 && (
            <button
              type="button"
              onClick={(e) => scroll('left', e)}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/75 hover:bg-black text-white transition-all shadow-lg cursor-pointer z-30 hover:scale-105"
              title="Previous media"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          {/* Right Arrow */}
          {activeIndex < media.length - 1 && (
            <button
              type="button"
              onClick={(e) => scroll('right', e)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/75 hover:bg-black text-white transition-all shadow-lg cursor-pointer z-30 hover:scale-105"
              title="Next media"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}

          {/* Page Counter Badge */}
          <div className="absolute top-2.5 right-2.5 bg-black/75 backdrop-blur-xs px-2.5 py-0.5 rounded-full text-xs font-semibold text-white pointer-events-none z-30">
            {activeIndex + 1} / {media.length}
          </div>
        </>
      )}
    </div>
  );
};

const PostItem = ({ post, setPosts, onBookmarkToggle }) => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { toggleLike, toggleRetweet, toggleBookmark, sharePost, deletePost } = usePost();
  const { showToast } = useOutletContext() || {};
  const { formatNumber, formatTimeAgo } = useFormatter();

  const [showMenu, setShowMenu] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const menuRef = useRef(null);

  const postId = post?._id || post?.id;
  const ownerId = post?.owner?._id || post?.owner || post?.author?._id || post?.author?.id;
  const isOwner = currentUser?._id && String(currentUser._id) === String(ownerId);

  // Automatically trigger backend reach recording API silently when post appears on user's screen
  const containerRef = usePostReach(postId);

  // Robust calculation for initial and dynamic retweet, like, and reach counts
  const retweetCount =
    typeof post?.totalRetweets === 'number'
      ? post.totalRetweets
      : typeof post?.retweets === 'number'
      ? post.retweets
      : Array.isArray(post?.retweets)
      ? post.retweets.length
      : 0;

  const likeCount =
    typeof post?.totalLikes === 'number'
      ? post.totalLikes
      : typeof post?.likes === 'number'
      ? post.likes
      : Array.isArray(post?.likes)
      ? post.likes.length
      : 0;

  const reachCount =
    typeof post?.totalReach === 'number'
      ? post.totalReach
      : typeof post?.views === 'number'
      ? post.views
      : typeof post?.reach === 'number'
      ? post.reach
      : 0;

  // Close dropdown menu on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  const handleProfileClick = (e) => {
    e.stopPropagation();
    if (ownerId) {
      navigate(`/profile/${ownerId}`);
    }
  };

  const handleLikeClick = (e) => {
    e.stopPropagation();
    toggleLike(postId, setPosts, showToast);
  };

  const handleRetweetClick = (e) => {
    e.stopPropagation();
    toggleRetweet(postId, setPosts, showToast);
  };

  const handleBookmarkClick = (e) => {
    e.stopPropagation();
    toggleBookmark(postId, setPosts, showToast);
    if (onBookmarkToggle) {
      onBookmarkToggle(postId);
    }
  };

  const handleShareClick = (e) => {
    e.stopPropagation();
    sharePost(postId, showToast);
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    setShowMenu(false);
    deletePost(postId, setPosts, showToast);
  };

  return (
    <>
      {/* Edit Post Modal */}
      <EditPostModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        post={post}
        setPosts={setPosts}
        showToast={showToast}
      />

      <article
        ref={containerRef}
        onClick={() => navigate(`/post/${postId}`)}
        className="p-4 hover:bg-[#080808] transition-colors flex gap-3.5 cursor-pointer relative"
      >
        {/* Owner Avatar (Navigates to Profile) */}
        <img
          src={getAvatarUrl(post?.owner?.avatar || post?.author?.avatar)}
          alt={post?.owner?.fullName || post?.author?.fullName}
          onClick={handleProfileClick}
          className="w-11 h-11 rounded-full object-cover shrink-0 bg-[#16181c] cursor-pointer hover:opacity-80 transition-opacity"
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col gap-2 min-w-0">
          
          {/* Owner Meta Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5 text-sm truncate">
              <span
                onClick={handleProfileClick}
                className="font-bold text-white hover:underline truncate cursor-pointer"
              >
                {post?.owner?.fullName || post?.author?.fullName}
              </span>
              {(post?.owner?.isVerified || post?.author?.verified) && (
                <CheckCircle2 className="w-4 h-4 text-[#1d9bf0] shrink-0" />
              )}
              <span
                onClick={handleProfileClick}
                className="text-gray-500 truncate cursor-pointer hover:underline"
              >
                @{post?.owner?.username || post?.author?.username}
              </span>
              <span className="text-gray-500">·</span>
              <span className="text-gray-500 shrink-0">
                {formatTimeAgo(post?.createdAt)}
              </span>
            </div>

            {/* Options Menu Button & Dropdown */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(!showMenu);
                }}
                className="p-1.5 rounded-full hover:bg-[#181818] text-gray-500 hover:text-white transition-colors cursor-pointer"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>

              {showMenu && (
                <div className="absolute right-0 top-full mt-1 w-44 bg-[#16181c] border border-[#2f3336] rounded-2xl shadow-2xl overflow-hidden z-50 animate-fade-in py-1">
                  {isOwner ? (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowMenu(false);
                          setIsEditModalOpen(true);
                        }}
                        className="w-full flex items-center space-x-2.5 px-4 py-2.5 text-xs font-semibold text-gray-200 hover:bg-[#202327] transition-colors text-left cursor-pointer"
                      >
                        <Pencil className="w-4 h-4 text-[#1d9bf0]" />
                        <span>Edit Post</span>
                      </button>
                      <button
                        onClick={handleDeleteClick}
                        className="w-full flex items-center space-x-2.5 px-4 py-2.5 text-xs font-semibold text-red-400 hover:bg-red-950/40 transition-colors text-left cursor-pointer border-t border-[#2f3336]/60"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                        <span>Delete Post</span>
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMenu(false);
                        handleShareClick(e);
                      }}
                      className="w-full flex items-center space-x-2.5 px-4 py-2.5 text-xs font-semibold text-gray-300 hover:bg-[#202327] transition-colors text-left cursor-pointer"
                    >
                      <Share className="w-4 h-4 text-gray-400" />
                      <span>Share Post</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Post Text */}
          <p className="text-[#e7e9ea] text-[15px] leading-normal whitespace-pre-line break-words">
            {post?.content}
          </p>

          {/* Post Media Attachments (Scrollable Carousel with full width & arrows) */}
          {Array.isArray(post?.media) && post.media.length > 0 ? (
            <MediaCarousel media={post.media} maxH="max-h-96" />
          ) : post?.image ? (
            <div className="mt-2 rounded-2xl overflow-hidden border border-[#2f3336] max-h-96">
              <img src={post?.image} alt="post media" className="w-full h-full object-cover" />
            </div>
          ) : null}

          {/* Action Buttons Row */}
          <div className="flex items-center justify-between text-gray-500 w-full max-w-lg pt-2 text-xs">
            
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
              <span>{formatNumber(retweetCount)}</span>
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
              <span>{formatNumber(likeCount)}</span>
            </button>

            {/* Views */}
            <div className="flex items-center space-x-2">
              <div className="p-2">
                <BarChart2 className="w-4 h-4" />
              </div>
              <span>{formatNumber(reachCount)}</span>
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
    </>
  );
};

export default PostItem;
