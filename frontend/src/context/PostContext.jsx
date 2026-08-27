import React, { createContext, useContext, useState, useCallback } from 'react';
import api from '../utils/axiosApi.util';

const PostContext = createContext(null);

export const PostProvider = ({ children }) => {
  const [feedRefreshKey, setFeedRefreshKey] = useState(0);

  const triggerToast = (showToast, message) => {
    if (showToast && typeof showToast === 'function') {
      showToast(message);
    }
  };

  // Signal home feed / stream refresh
  const refreshFeed = useCallback(() => {
    setFeedRefreshKey((prev) => prev + 1);
  }, []);

  // Create Post Action in Context
  const createPost = useCallback(async (content, showToast) => {
    if (!content || !content.trim()) return null;

    try {
      const res = await api.post('/tweets/', { content: content.trim() });
      const createdTweet = res?.data?.data;
      triggerToast(showToast, 'Your post was sent!');

      // Automatically refresh the home feed
      refreshFeed();

      return createdTweet;
    } catch (error) {
      triggerToast(showToast, error?.response?.data?.message || 'Failed to create post');
      throw error;
    }
  }, [refreshFeed]);

  // Edit Post Action in Context
  const editPost = useCallback(async (postId, newContent, setPosts, showToast) => {
    if (!newContent || !newContent.trim()) return;

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
      triggerToast(showToast, error?.response?.data?.message || 'Failed to edit post');
      throw error;
    }
  }, [refreshFeed]);

  // Delete Post Action in Context
  const deletePost = useCallback(async (postId, setPosts, showToast) => {
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
      triggerToast(showToast, error?.response?.data?.message || 'Failed to delete post');
    }
  }, [refreshFeed]);

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

  // Toggle Retweet Action (optimistic state toggle + API endpoint trigger)
  const toggleRetweet = useCallback(async (postId, setPosts, showToast) => {
    let nextRetweetedState = false;

    if (setPosts) {
      setPosts((prevPosts) =>
        prevPosts
          ? prevPosts.map((post) => {
              const id = post._id || post.id;
              if (String(id) === String(postId)) {
                nextRetweetedState = !post.isRetweeted;
                return {
                  ...post,
                  isRetweeted: nextRetweetedState,
                  retweets: nextRetweetedState
                    ? (post.retweets || 0) + 1
                    : Math.max(0, (post.retweets || 1) - 1),
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
      triggerToast(showToast, error?.response?.data?.message || 'Failed to toggle retweet');
    }
  }, []);

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
