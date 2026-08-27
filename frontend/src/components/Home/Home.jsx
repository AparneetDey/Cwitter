import React, { useCallback, useEffect, useState } from 'react';
import { useOutletContext } from 'react-router';
import { usePost } from '../../context/PostContext';
import FeedHeader from '../layout/FeedHeader';
import PostComposer from '../post/PostComposer';
import PostList from '../post/PostList';
import api from '../../utils/axiosApi.util';

const Home = () => {
  const { feedRefreshKey, createPost } = usePost();
  const { showToast } = useOutletContext() || {};
  const [activeTab, setActiveTab] = useState('forYou');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch "For You" Feed from API
  const fetchFeed = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/tweets/feed/for-you');
      const feedData = res?.data?.data || [];
      setPosts(feedData);
    } catch (error) {
      if (showToast) showToast(error?.response?.data?.message || 'Failed to load feed');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // Re-fetch feed whenever feedRefreshKey changes (e.g. on post creation from modal or composer)
  useEffect(() => {
    fetchFeed();
  }, [fetchFeed, feedRefreshKey]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    fetchFeed();
  };

  const handlePostCreate = async (text) => {
    try {
      await createPost(text, showToast);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <main className="w-full max-w-150 border-r border-[#2f3336] min-h-screen">
      <FeedHeader activeTab={activeTab} setActiveTab={handleTabChange} />
      <PostComposer onPostCreate={handlePostCreate} />
      <PostList
        posts={posts}
        setPosts={setPosts}
        loading={loading}
        emptyMessage="No posts in your feed yet. Be the first to share a post!"
      />
    </main>
  );
};

export default Home;
