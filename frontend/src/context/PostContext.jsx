import React, { createContext, useContext, useState, useCallback } from 'react';
import api from '../utils/axiosApi.util';
import { useAuth } from './AuthContext';
import VerificationModal from '../components/profile/VerificationModal';
import uploadToImageKit from '../utils/imageKit';

const PostContext = createContext(null);

export const PostProvider = ({ children }) => {
  const { user } = useAuth();
  const [feedRefreshKey, setFeedRefreshKey] = useState(0);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);

  const triggerToast = (showToast, message) => {
    if (showToast && typeof showToast === 'function') {
      showToast(message);
    }
  };

  const openVerificationModal = useCallback(() => {
    setIsVerificationModalOpen(true);
  }, []);

  const closeVerificationModal = useCallback(() => {
    setIsVerificationModalOpen(false);
  }, []);

  // Signal home feed / stream refresh
  const refreshFeed = useCallback(() => {
    setFeedRefreshKey((prev) => prev + 1);
  }, []);

  // Create Post Action in Context (Checks isVerified & handles 401 unverified error)
  const createPost = useCallback(async (content, rawMedia = [], showToast = null) => {

    if (!content || !content.trim()) return null;

    if (!user?.isVerified) {
      triggerToast(showToast, 'Account verification required to create posts.');
      openVerificationModal();
      return null;
    }

    try {
      const mediaUrls = [];

      // If raw File objects are passed, upload them to ImageKit when creating the tweet
      if (Array.isArray(rawMedia) && rawMedia.length > 0) {
        for (const item of rawMedia) {
          const fileToUpload = item instanceof File ? item : (item?.file instanceof File ? item.file : null);
          if (fileToUpload) {
            try {
              const res = await uploadToImageKit(fileToUpload);
              if (res?.url) {
                mediaUrls.push(res.url);
              }
            } catch (uErr) {
              console.warn("Failed to upload file to ImageKit:", uErr);
            }
          } else if (typeof item === 'string' && item.startsWith('http')) {
            mediaUrls.push(item);
          }
        }
      }

      const res = await api.post('/tweets/', { content: content.trim(), media: mediaUrls });
      const createdTweet = res?.data?.data;

      // Register Media document entries via Media API controller
      if (createdTweet?._id && mediaUrls.length > 0) {
        for (const url of mediaUrls) {
          try {
            await api.post(`/medias/add/${createdTweet._id}`, { url });
          } catch (mErr) {
            console.warn('Failed to register media doc:', mErr);
          }
        }
      }

      triggerToast(showToast, 'Your post was sent!');
      refreshFeed();
      return createdTweet;
    } catch (error) {
      const msg = error?.response?.data?.message || 'Failed to create post';
      if (msg.includes('not verified') || error?.response?.status === 401) {
        triggerToast(showToast, 'Account verification required to create posts.');
        openVerificationModal();
      } else {
        triggerToast(showToast, msg);
      }
      throw error;
    }
  }, [user, openVerificationModal, refreshFeed]);

  // Edit Post Action in Context
  const editPost = useCallback(async (postId, newContent, setPosts, showToast) => {
    if (!newContent || !newContent.trim()) return;

    if (!user?.isVerified) {
      triggerToast(showToast, 'Account verification required to edit posts.');
      openVerificationModal();
      return;
    }

    if (setPosts) {
      setPosts((prevPosts) =>
        prevPosts
          ? prevPosts.map((post) => {
              const id = post._id || post.id;
              if (String(id) === String(postId)) {
                return { ...post, content: newContent.trim() };
              }
              return post;
            })
          : prevPosts
      );
    }

    try {
      const res = await api.patch(`/tweets/edit/${postId}`, { content: newContent.trim() });
      triggerToast(showToast, res?.data?.message || 'Post updated successfully!');
      refreshFeed();
    } catch (error) {
      const msg = error?.response?.data?.message || 'Failed to edit post';
      if (msg.includes('not verified')) {
        triggerToast(showToast, 'Account verification required to edit posts.');
        openVerificationModal();
      } else {
        triggerToast(showToast, msg);
      }
      throw error;
    }
  }, [user, openVerificationModal, refreshFeed]);

  // Delete Post Action in Context
  const deletePost = useCallback(async (postId, setPosts, showToast) => {
    if (!user?.isVerified) {
      triggerToast(showToast, 'Account verification required to delete posts.');
      openVerificationModal();
      return;
    }

    if (setPosts) {
      setPosts((prevPosts) =>
        prevPosts
          ? prevPosts.filter((post) => String(post._id || post.id) !== String(postId))
          : prevPosts
      );
    }

    try {
      const res = await api.delete(`/tweets/delete/${postId}`);
      triggerToast(showToast, res?.data?.message || 'Post deleted successfully');
      refreshFeed();
    } catch (error) {
      const msg = error?.response?.data?.message || 'Failed to delete post';
      if (msg.includes('not verified')) {
        triggerToast(showToast, 'Account verification required to delete posts.');
        openVerificationModal();
      } else {
        triggerToast(showToast, msg);
      }
    }
  }, [user, openVerificationModal, refreshFeed]);

  // Toggle Like Action
  const toggleLike = useCallback((postId, setPosts) => {
    if (!setPosts) return;

    setPosts((prevPosts) =>
      prevPosts
        ? prevPosts.map((post) => {
            const id = post._id || post.id;
            if (String(id) === String(postId)) {
              const isLiked = !post.isLiked;
              return {
                ...post,
                isLiked,
                likes: isLiked ? (post.likes || 0) + 1 : Math.max(0, (post.likes || 1) - 1),
              };
            }
            return post;
          })
        : prevPosts
    );
  }, []);

  // Toggle Retweet Action (optimistic state toggle + API endpoint trigger with isVerified check)
  const toggleRetweet = useCallback(async (postId, setPosts, showToast) => {
    if (!user?.isVerified) {
      triggerToast(showToast, 'Account verification required to retweet.');
      openVerificationModal();
      return;
    }

    let nextRetweetedState = false;

    if (setPosts) {
      setPosts((prevPosts) =>
        prevPosts
          ? prevPosts.map((post) => {
              const id = post._id || post.id;
              if (String(id) === String(postId)) {
                nextRetweetedState = !post.isRetweeted;

                const currentCount =
                  typeof post.totalRetweets === 'number'
                    ? post.totalRetweets
                    : typeof post.retweets === 'number'
                    ? post.retweets
                    : Array.isArray(post.retweets)
                    ? post.retweets.length
                    : 0;

                const nextCount = nextRetweetedState
                  ? currentCount + 1
                  : Math.max(0, currentCount - 1);

                return {
                  ...post,
                  isRetweeted: nextRetweetedState,
                  totalRetweets: nextCount,
                  retweets: nextCount,
                };
              }
              return post;
            })
          : prevPosts
      );
    }

    try {
      const res = await api.get(`/tweets/retweet/${postId}`);
      triggerToast(showToast, res?.data?.message || (nextRetweetedState ? 'Retweeted' : 'Undo retweet'));
    } catch (error) {
      const msg = error?.response?.data?.message || 'Failed to toggle retweet';
      if (msg.includes('not verified')) {
        triggerToast(showToast, 'Account verification required to retweet.');
        openVerificationModal();
      } else {
        triggerToast(showToast, msg);
      }
    }
  }, [user, openVerificationModal]);

  // Toggle Bookmark Action (optimistic state toggle + API endpoint trigger)
  const toggleBookmark = useCallback(async (postId, setPosts, showToast) => {
    let nextBookmarkedState = false;

    if (setPosts) {
      setPosts((prevPosts) =>
        prevPosts
          ? prevPosts.map((post) => {
              const id = post._id || post.id;
              if (String(id) === String(postId)) {
                nextBookmarkedState = !post.isBookmarked;
                return {
                  ...post,
                  isBookmarked: nextBookmarkedState,
                };
              }
              return post;
            })
          : prevPosts
      );
    }

    try {
      const res = await api.get(`/tweets/bookmark/${postId}`);
      const message =
        res?.data?.message || (nextBookmarkedState ? 'Added to your Bookmarks' : 'Removed from Bookmarks');
      triggerToast(showToast, message);
    } catch (error) {
      triggerToast(showToast, error?.response?.data?.message || 'Failed to toggle bookmark');
    }
  }, []);

  // Share Post Action
  const sharePost = useCallback((postId, showToast) => {
    const postUrl = `${window.location.origin}/post/${postId}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(postUrl);
    }
    triggerToast(showToast, 'Post link copied to clipboard!');
  }, []);

  const value = {
    feedRefreshKey,
    refreshFeed,
    createPost,
    editPost,
    deletePost,
    toggleLike,
    toggleRetweet,
    toggleBookmark,
    sharePost,
    isVerificationModalOpen,
    openVerificationModal,
    closeVerificationModal,
  };

  return (
    <PostContext.Provider value={value}>
      {children}

      {/* Global Account Verification Modal */}
      <VerificationModal
        isOpen={isVerificationModalOpen}
        onClose={closeVerificationModal}
        user={user}
        onVerifiedSuccess={() => {
          triggerToast(null, 'Account verified successfully! 🎉');
        }}
      />
    </PostContext.Provider>
  );
};

export default PostProvider;

export const usePost = () => {
  const context = useContext(PostContext);
  if (!context) {
    throw new Error('usePost must be used within a PostProvider');
  }
  return context;
};
