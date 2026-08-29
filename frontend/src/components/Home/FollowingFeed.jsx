import React, { useCallback, useEffect, useState } from 'react';
import { useOutletContext } from 'react-router';
import { usePost } from '../../context/PostContext';
import PostList from '../post/PostList';
import api from '../../utils/axiosApi.util';

const FollowingFeed = () => {
  const { feedRefreshKey } = usePost();
  const { showToast } = useOutletContext() || {};
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch "Following" Feed from API
  const fetchFeed = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/tweets/feed/following');
      const feedData = res?.data?.data?.tweets || [];
      setPosts(feedData);
    } catch (error) {
      if (showToast) showToast(error?.response?.data?.message || 'Failed to load Following feed');
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
      emptyMessage="No posts from accounts you follow. Follow some users to see their posts here!"
    />
  );
};

export default FollowingFeed;
