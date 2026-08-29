import React, { useState } from 'react';
import { useOutletContext } from 'react-router';
import { usePost } from '../../context/PostContext';
import FeedHeader from '../layout/FeedHeader';
import PostComposer from '../post/PostComposer';
import ForYouFeed from './ForYouFeed';
import FollowingFeed from './FollowingFeed';

const Home = () => {
  const { createPost } = usePost();
  const { showToast } = useOutletContext() || {};
  const [activeTab, setActiveTab] = useState('forYou');

  const handlePostCreate = async (text, mediaList) => {
    try {
      await createPost(text, mediaList, showToast);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <main className="w-full max-w-150 border-r border-[#2f3336] min-h-screen">
      <FeedHeader activeTab={activeTab} setActiveTab={setActiveTab} />
      <PostComposer onPostCreate={handlePostCreate} />
      {activeTab === 'forYou' ? <ForYouFeed /> : <FollowingFeed />}
    </main>
  );
};

export default Home;
