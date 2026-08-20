import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import FeedHeader from '../layout/FeedHeader';
import PostComposer from '../post/PostComposer';
import PostList from '../post/PostList';

const INITIAL_POSTS = [
  {
    id: 1,
    author: {
      fullName: 'Cwitter Official',
      username: 'cwitter',
      avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
      verified: true,
    },
    createdAt: '2h',
    content: 'Welcome to the official launch of Cwitter! 🚀 Built with Express, React, and Tailwind CSS. Connect, share your thoughts, and see what is happening right now across the world.',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    likes: 1240,
    retweets: 382,
    replies: 94,
    views: '45.2K',
    isLiked: false,
    isRetweeted: false,
    isBookmarked: false,
  },
  {
    id: 2,
    author: {
      fullName: 'Sarah Chen',
      username: 'sarah_codes',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      verified: true,
    },
    createdAt: '4h',
    content: 'Just finished setting up hot reloading and authentication routing for our fullstack Express + Vite application. Clean code structure makes development such a joy! 💻⚡',
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80',
    likes: 856,
    retweets: 142,
    replies: 31,
    views: '18.9K',
    isLiked: true,
    isRetweeted: false,
    isBookmarked: true,
  },
  {
    id: 3,
    author: {
      fullName: 'Design Daily',
      username: 'designdaily',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      verified: false,
    },
    createdAt: '6h',
    content: 'Dark mode user interfaces require careful contrast calibration. Pure black (#000000) combined with subtle electric blue accents creates a sleek, high-premium aesthetic.',
    likes: 420,
    retweets: 88,
    replies: 12,
    views: '9.4K',
    isLiked: false,
    isRetweeted: false,
    isBookmarked: false,
  },
];

const Home = () => {
  const { user } = useAuth();
  const { showToast } = useOutletContext() || {};
  const [activeTab, setActiveTab] = useState('forYou');
  const [posts, setPosts] = useState(INITIAL_POSTS);
  const [loading, setLoading] = useState(true);

  // Initial feed loading simulation
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 400);
  };

  const handlePostCreate = (text) => {
    const newPost = {
      id: Date.now(),
      author: {
        fullName: user?.fullName || 'Anonymous User',
        username: user?.username || 'user',
        avatar: user?.avatar || '',
        verified: user?.isVerified || false,
      },
      createdAt: 'Just now',
      content: text,
      likes: 0,
      retweets: 0,
      replies: 0,
      views: '1',
      isLiked: false,
      isRetweeted: false,
      isBookmarked: false,
    };

    setPosts([newPost, ...posts]);
    if (showToast) showToast('Your post was sent!');
  };

  const handleLike = (postId) => {
    setPosts(
      posts.map((post) => {
        if (post.id === postId) {
          const isLiked = !post.isLiked;
          return {
            ...post,
            isLiked,
            likes: isLiked ? post.likes + 1 : post.likes - 1,
          };
        }
        return post;
      })
    );
  };

  const handleRetweet = (postId) => {
    setPosts(
      posts.map((post) => {
        if (post.id === postId) {
          const isRetweeted = !post.isRetweeted;
          return {
            ...post,
            isRetweeted,
            retweets: isRetweeted ? post.retweets + 1 : post.retweets - 1,
          };
        }
        return post;
      })
    );
  };

  const handleBookmark = (postId) => {
    setPosts(
      posts.map((post) => {
        if (post.id === postId) {
          const isBookmarked = !post.isBookmarked;
          if (showToast) showToast(isBookmarked ? 'Added to your Bookmarks' : 'Removed from Bookmarks');
          return { ...post, isBookmarked };
        }
        return post;
      })
    );
  };

  const handleShare = () => {
    if (showToast) showToast('Post link copied to clipboard!');
  };

  return (
    <main className="w-full max-w-150 border-r border-[#2f3336] min-h-screen">
      <FeedHeader activeTab={activeTab} setActiveTab={handleTabChange} />
      <PostComposer onPostCreate={handlePostCreate} />
      <PostList
        posts={posts}
        loading={loading}
        onLike={handleLike}
        onRetweet={handleRetweet}
        onBookmark={handleBookmark}
        onShare={handleShare}
      />
    </main>
  );
};

export default Home;
