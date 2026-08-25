import React, { createContext, useContext, useCallback } from 'react';
import api from '../utils/axiosApi.util';

const PostContext = createContext(null);

export const PostProvider = ({ children }) => {
  // Helper to trigger toast safely
  const triggerToast = (showToast, message) => {
    if (showToast && typeof showToast === 'function') {
      showToast(message);
    }
  };

  // Toggle Like Action
  const toggleLike = useCallback((postId, posts, setPosts) => {
    if (!posts || !setPosts) return;

    setPosts((prevPosts) =>
      prevPosts.map((post) => {
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
    );
  }, []);

  // Toggle Retweet Action (with API call)
  const toggleRetweet = useCallback(async (postId, posts, setPosts, showToast) => {
    let nextRetweetedState = false;

    if (posts && setPosts) {
      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          const id = post._id || post.id;
          if (String(id) === String(postId)) {
            nextRetweetedState = !post.isRetweeted;
            return {
              ...post,
              isRetweeted: nextRetweetedState,
              retweets: nextRetweetedState ? (post.retweets || 0) + 1 : Math.max(0, (post.retweets || 1) - 1),
            };
          }
          return post;
        })
      );
    }

    try {
      const res = await api.get(`/tweets/retweet/${postId}`);
      triggerToast(showToast, res?.data?.message || (nextRetweetedState ? 'Retweeted' : 'Undo retweet'));
    } catch (error) {
      triggerToast(showToast, error?.response?.data?.message || 'Failed to toggle retweet');
    }
  }, []);

  // Toggle Bookmark Action (with API call)
  const toggleBookmark = useCallback(async (postId, posts, setPosts, showToast) => {
    let nextBookmarkedState = false;

    if (posts && setPosts) {
      setPosts((prevPosts) =>
        prevPosts.map((post) => {
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
      );
    }

    try {
      const res = await api.get(`/tweets/bookmark/${postId}`);
      const message = res?.data?.message || (nextBookmarkedState ? 'Added to your Bookmarks' : 'Removed from Bookmarks');
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
    toggleLike,
    toggleRetweet,
    toggleBookmark,
    sharePost,
  };

  return <PostContext.Provider value={value}>{children}</PostContext.Provider>;
};

export default PostProvider;

export const usePost = () => {
  const context = useContext(PostContext);
  if (!context) {
    throw new Error('usePost must be used within a PostProvider');
  }
  return context;
};
