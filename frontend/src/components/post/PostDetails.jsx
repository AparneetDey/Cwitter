import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router';
import {
  ArrowLeft,
  Heart,
  Repeat2,
  MessageCircle,
  Share,
  Bookmark,
  CheckCircle2,
  MoreHorizontal,
  Pencil,
  Trash2,
  Loader2
} from 'lucide-react';
import api from '../../utils/axiosApi.util';
import { getAvatarUrl } from '../../utils/constants';
import { usePost } from '../../context/PostContext';
import { useAuth } from '../../context/AuthContext';
import useFormatter from '../../hooks/useFormatter';
import EditPostModal from './EditPostModal';

const PostDetails = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { toggleLike, toggleRetweet, toggleBookmark, sharePost, deletePost } = usePost();
  const { showToast } = useOutletContext() || {};
  const { formatNumber, formatDate } = useFormatter();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Fetch single tweet details from API using getATweet controller
  const fetchTweetDetails = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/tweets/${postId}`);
      const tweetData = res?.data?.data;
      setPost(tweetData);
    } catch (error) {
      if (showToast) showToast(error?.response?.data?.message || 'Failed to fetch tweet details');
      setPost(null);
    } finally {
      setLoading(false);
    }
  }, [postId, showToast]);

  useEffect(() => {
    fetchTweetDetails();
  }, [fetchTweetDetails]);

  const ownerId = post?.owner?._id || post?.owner || post?.author?._id;
  const isOwner = currentUser?._id && String(currentUser._id) === String(ownerId);

  // Robust calculation for initial and dynamic retweet count
  const retweetCount =
    typeof post?.totalRetweets === 'number'
      ? post.totalRetweets
      : typeof post?.retweets === 'number'
      ? post.retweets
      : Array.isArray(post?.retweets)
      ? post.retweets.length
      : 0;

  const handleProfileClick = (e) => {
    e.stopPropagation();
    if (ownerId) {
      navigate(`/profile/${ownerId}`);
    }
  };

  const handleLikeClick = () => {
    toggleLike(postId, setPostSingle);
  };

  const setPostSingle = (updater) => {
    setPost((prev) => {
      if (!prev) return prev;
      if (typeof updater === 'function') {
        const dummyArr = [prev];
        const resArr = updater(dummyArr);
        return resArr && resArr.length > 0 ? resArr[0] : prev;
      }
      return prev;
    });
  };

  const handleRetweetClick = () => {
    toggleRetweet(postId, setPostSingle, showToast);
  };

  const handleBookmarkClick = () => {
    toggleBookmark(postId, setPostSingle, showToast);
  };

  const handleShareClick = () => {
    sharePost(postId, showToast);
  };

  const handleDeleteClick = () => {
    setShowMenu(false);
    deletePost(postId, null, showToast);
    navigate(-1);
  };

  return (
    <>
      {/* Edit Post Modal */}
      {post && (
        <EditPostModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          post={post}
          setPosts={setPostSingle}
          showToast={showToast}
        />
      )}

      <main className="w-full max-w-150 border-r border-[#2f3336] bg-black min-h-screen pb-16">
        
        {/* Header */}
        <header className="sticky top-0 bg-black/80 backdrop-blur-md z-30 border-b border-[#2f3336] flex items-center space-x-6 px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-[#181818] text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-bold text-white tracking-wide">Post</h2>
        </header>

        {/* Loading Skeleton */}
        {loading ? (
          <div className="p-8 flex flex-col items-center justify-center space-y-4 text-gray-500">
            <Loader2 className="w-8 h-8 animate-spin text-[#1d9bf0]" />
            <span className="text-xs">Loading post...</span>
          </div>
        ) : !post ? (
          /* Empty / Error State */
          <div className="p-12 text-center text-gray-500">
            <p className="text-base font-semibold text-white mb-1">Post not found</p>
            <p className="text-xs">This post may have been deleted or does not exist.</p>
          </div>
        ) : (
          /* Single Post Detail View */
          <article className="p-5 border-b border-[#2f3336] space-y-4">
            
            {/* Author Meta Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 cursor-pointer" onClick={handleProfileClick}>
                <img
                  src={getAvatarUrl(post?.owner?.avatar || post?.author?.avatar)}
                  alt={post?.owner?.fullName || post?.author?.fullName}
                  className="w-12 h-12 rounded-full object-cover shrink-0 bg-[#16181c] hover:opacity-80 transition-opacity"
                />
                <div className="flex flex-col">
                  <div className="flex items-center space-x-1.5">
                    <span className="font-bold text-white text-base hover:underline">
                      {post?.owner?.fullName || post?.author?.fullName}
                    </span>
                    {(post?.owner?.isVerified || post?.author?.verified) && (
                      <CheckCircle2 className="w-4 h-4 text-[#1d9bf0] shrink-0" />
                    )}
                  </div>
                  <span className="text-gray-500 text-sm">
                    @{post?.owner?.username || post?.author?.username}
                  </span>
                </div>
              </div>

              {/* Options Menu Button & Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-2 rounded-full hover:bg-[#181818] text-gray-500 hover:text-white transition-colors cursor-pointer"
                >
                  <MoreHorizontal className="w-5 h-5" />
                </button>

                {showMenu && (
                  <div className="absolute right-0 top-full mt-1 w-44 bg-[#16181c] border border-[#2f3336] rounded-2xl shadow-2xl overflow-hidden z-50 animate-fade-in py-1">
                    {isOwner ? (
                      <>
                        <button
                          onClick={() => {
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
                        onClick={() => {
                          setShowMenu(false);
                          handleShareClick();
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

            {/* Post Content */}
            <p className="text-[#e7e9ea] text-xl leading-relaxed whitespace-pre-line break-words pt-1">
              {post?.content}
            </p>

            {/* Post Media Attachments (Images & Videos) */}
            {(Array.isArray(post?.media) && post.media.length > 0) ? (
              <div className="space-y-3">
                {post.media.map((url, idx) => (
                  <div key={idx} className="rounded-2xl overflow-hidden border border-[#2f3336] max-h-112">
                    {url.match(/\.(mp4|webm|mov)$/i) ? (
                      <video src={url} controls className="w-full h-full object-cover" />
                    ) : (
                      <img src={url} alt={`post media ${idx}`} className="w-full h-full object-cover" />
                    )}
                  </div>
                ))}
              </div>
            ) : post?.image ? (
              <div className="rounded-2xl overflow-hidden border border-[#2f3336] max-h-112">
                <img src={post?.image} alt="post media" className="w-full h-full object-cover" />
              </div>
            ) : null}

            {/* Timestamp & Meta Row */}
            <div className="py-3 border-y border-[#2f3336] text-gray-500 text-sm flex items-center space-x-2">
              <span>{formatDate(post?.createdAt)}</span>
              <span>·</span>
              <span className="text-white font-semibold">{post?.views || '100'}</span>
              <span>Views</span>
            </div>

            {/* Engagement Stats Breakdown */}
            {(retweetCount > 0 || post?.likes > 0) && (
              <div className="py-3 border-b border-[#2f3336] flex items-center space-x-6 text-sm">
                {retweetCount > 0 && (
                  <span className="text-gray-500">
                    <strong className="text-white font-bold">{formatNumber(retweetCount)}</strong> Retweets
                  </span>
                )}
                {post?.likes > 0 && (
                  <span className="text-gray-500">
                    <strong className="text-white font-bold">{formatNumber(post.likes)}</strong> Likes
                  </span>
                )}
              </div>
            )}

            {/* Main Action Bar */}
            <div className="flex items-center justify-around text-gray-500 py-1 border-b border-[#2f3336]">
              {/* Reply */}
              <button className="p-2.5 rounded-full hover:bg-[#1d9bf0]/10 hover:text-[#1d9bf0] transition-colors cursor-pointer">
                <MessageCircle className="w-5 h-5" />
              </button>

              {/* Retweet */}
              <button
                onClick={handleRetweetClick}
                className={`p-2.5 rounded-full hover:bg-emerald-500/10 transition-colors cursor-pointer ${
                  post?.isRetweeted ? 'text-emerald-500' : 'hover:text-emerald-500'
                }`}
              >
                <Repeat2 className="w-5 h-5" />
              </button>

              {/* Like */}
              <button
                onClick={handleLikeClick}
                className={`p-2.5 rounded-full hover:bg-rose-500/10 transition-colors cursor-pointer ${
                  post?.isLiked ? 'text-rose-500' : 'hover:text-rose-500'
                }`}
              >
                <Heart className={`w-5 h-5 ${post?.isLiked ? 'fill-current text-rose-500' : ''}`} />
              </button>

              {/* Bookmark */}
              <button
                onClick={handleBookmarkClick}
                className={`p-2.5 rounded-full hover:bg-[#1d9bf0]/10 transition-colors cursor-pointer ${
                  post?.isBookmarked ? 'text-[#1d9bf0]' : 'hover:text-[#1d9bf0]'
                }`}
              >
                <Bookmark className={`w-5 h-5 ${post?.isBookmarked ? 'fill-current' : ''}`} />
              </button>

              {/* Share */}
              <button
                onClick={handleShareClick}
                className="p-2.5 rounded-full hover:bg-[#1d9bf0]/10 hover:text-[#1d9bf0] transition-colors cursor-pointer"
              >
                <Share className="w-5 h-5" />
              </button>
            </div>

          </article>
        )}

      </main>
    </>
  );
};

export default PostDetails;
