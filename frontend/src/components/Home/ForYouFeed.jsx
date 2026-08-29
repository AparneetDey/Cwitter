import React, { useCallback, useEffect, useState } from 'react';
import { useOutletContext } from 'react-router';
import { usePost } from '../../context/PostContext';
import PostList from '../post/PostList';
import api from '../../utils/axiosApi.util';

const ForYouFeed = () => {
  const { feedRefreshKey } = usePost();
  const { showToast } = useOutletContext() || {};
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch "For You" Feed from API
  const fetchFeed = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/tweets/feed/for-you');
      const feedData = res?.data?.data?.tweets || [];
      setPosts(feedData);
    } catch (error) {
      if (showToast) showToast(error?.response?.data?.message || 'Failed to load For You feed');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // Re-fetch feed whenever feedRefreshKey changes
  useEffect(() => {
    fetchFeed();
  }, [fetchFeed, feedRefreshKey]);

  return (
    <PostList
      posts={posts}
      setPosts={setPosts}
      loading={loading}
      emptyMessage="No posts in your feed yet. Be the first to share a post!"
    />
  );
};

export default ForYouFeed;
