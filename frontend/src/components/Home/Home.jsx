import React, { useCallback, useEffect, useState } from 'react';
import { useOutletContext } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import FeedHeader from '../layout/FeedHeader';
import PostComposer from '../post/PostComposer';
import PostList from '../post/PostList';
import api from '../../utils/axiosApi.util';

const Home = () => {
  const { user } = useAuth();
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

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    fetchFeed();
  };

  const handlePostCreate = async (text) => {
    try {
      const res = await api.post('/tweets/', { content: text });
      const createdTweet = res?.data?.data;

      // Format newly created tweet for immediate display in stream
      const newPost = {
        ...createdTweet,
        owner: {
          _id: user?._id,
          fullName: user?.fullName,
          username: user?.username,
          avatar: user?.avatar,
          isVerified: user?.isVerified,
        },
        likes: 0,
        retweets: 0,
        replies: 0,
        views: 1,
        isLiked: false,
        isRetweeted: false,
        isBookmarked: false,
      };

      setPosts((prev) => [newPost, ...(prev || [])]);
      if (showToast) showToast('Your post was sent!');
    } catch (error) {
      if (showToast) showToast(error?.response?.data?.message || 'Failed to send post');
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
