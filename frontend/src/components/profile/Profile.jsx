import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router';
import Sidebar from '../layout/Sidebar';
import RightSidebar from '../layout/RightSidebar';
import PostList from '../post/PostList';
import Toast from '../common/Toast';
import EditProfileModal from './EditProfileModal';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Link as LinkIcon,
  CheckCircle2,
  Edit3
} from 'lucide-react';

const INITIAL_USER_POSTS = [
  {
    id: 101,
    author: {
      fullName: 'Cwitter Developer',
      username: 'dev',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      verified: true,
    },
    createdAt: '1d',
    content: 'Just deployed the new User Profile page with customizable cover banner, avatar uploads, and edit profile modal! Try it out and let me know your feedback. 🎨✨',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    likes: 312,
    retweets: 48,
    replies: 16,
    views: '12.4K',
    isLiked: true,
    isRetweeted: false,
    isBookmarked: true,
  },
  {
    id: 102,
    author: {
      fullName: 'Cwitter Developer',
      username: 'dev',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      verified: true,
    },
    createdAt: '3d',
    content: 'Express + React + Tailwind CSS = unmatched developer productivity. Fullstack routing and clean component segregation completed. 💻🚀',
    likes: 540,
    retweets: 92,
    replies: 24,
    views: '18.1K',
    isLiked: false,
    isRetweeted: true,
    isBookmarked: false,
  },
];

const INITIAL_TRENDS = [
  { category: 'Technology · Trending', topic: '#ReactJS', posts: '45.2K posts' },
  { category: 'Web Development · Trending', topic: '#ExpressJS', posts: '28.4K posts' },
  { category: 'Trending in India', topic: '#CwitterLaunch', posts: '98.1K posts' },
];

const INITIAL_WHO_TO_FOLLOW = [
  { id: 1, fullName: 'Alex Rivera', username: 'alexrivera', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', verified: true, isFollowing: false },
  { id: 2, fullName: 'Elena Rostova', username: 'elena_tech', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80', verified: true, isFollowing: false },
];

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('posts');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [posts, setPosts] = useState(INITIAL_USER_POSTS);
  const [trends] = useState(INITIAL_TRENDS);
  const [whoToFollow, setWhoToFollow] = useState(INITIAL_WHO_TO_FOLLOW);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
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
          showToast(isBookmarked ? 'Added to your Bookmarks' : 'Removed from Bookmarks');
          return { ...post, isBookmarked };
        }
        return post;
      })
    );
  };

  const handleShare = () => {
    showToast('Post link copied to clipboard!');
  };

  const handleToggleFollow = (id) => {
    setWhoToFollow(
      whoToFollow.map((item) => {
        if (item.id === id) {
          return { ...item, isFollowing: !item.isFollowing };
        }
        return item;
      })
    );
  };

  return (
    <div className="min-h-screen bg-black text-[#e7e9ea] font-sans flex justify-center selection:bg-[#1d9bf0] selection:text-white">
      
      {/* Toast Notification */}
      <Toast message={toastMessage} />

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={user}
        onProfileUpdated={() => showToast('Profile updated successfully!')}
      />

      <div className="w-full max-w-7xl flex">
        
        {/* Left Sidebar */}
        <Sidebar />

        {/* Center Profile View */}
        <main className="flex-1 max-w-150 border-r border-[#2f3336] min-h-screen pb-16">
          
          {/* Header */}
          <header className="sticky top-0 bg-black/80 backdrop-blur-md z-30 border-b border-[#2f3336] flex items-center space-x-6 px-4 py-2">
            <button
              onClick={() => navigate('/')}
              className="p-2 rounded-full hover:bg-[#181818] text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center space-x-1.5">
                <span>{user.fullName}</span>
                <CheckCircle2 className="w-4 h-4 text-[#1d9bf0] fill-current" />
              </h2>
              <p className="text-gray-500 text-xs">{posts.length} Posts</p>
            </div>
          </header>

          {/* Cover Image Banner */}
          <div className="h-48 sm:h-56 bg-[#16181c] relative overflow-hidden">
            {user.coverImage ? (
              <img
                src={user.coverImage}
                alt="cover"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-[#1d9bf0]/40 via-[#7928ca]/30 to-[#00d2ff]/40"></div>
            )}
          </div>

          {/* Avatar & Edit Profile Header Bar */}
          <div className="px-4 pb-4 flex justify-between items-end relative">
            {/* Avatar */}
            <div className="-mt-16 sm:-mt-20 relative">
              <img
                src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                alt="avatar"
                className="w-28 h-28 sm:w-36 sm:h-36 rounded-full object-cover border-4 border-black bg-black"
              />
            </div>

            {/* Edit Profile Button */}
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="cwitter-btn-outline"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit profile</span>
            </button>
          </div>

          {/* User Information Details */}
          <div className="px-4 space-y-3.5 border-b border-[#2f3336] pb-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center space-x-1.5">
                <span>{user.fullName}</span>
                <CheckCircle2 className="w-5 h-5 text-[#1d9bf0] fill-current" />
              </h1>
              <p className="text-gray-500 text-sm">@{user.username}</p>
            </div>

            {/* Bio */}
            <p className="text-[#e7e9ea] text-sm leading-relaxed">
              Fullstack Engineer & UI Artisan 🚀 Building Cwitter with Express, React & Tailwind CSS. Passionate about performant web architectures.
            </p>

            {/* Metadata (Location & Joined Date) */}
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-gray-500 pt-1">
              <div className="flex items-center space-x-1">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span>India</span>
              </div>
              <div className="flex items-center space-x-1">
                <LinkIcon className="w-4 h-4 text-gray-500" />
                <a href="https://github.com" target="_blank" rel="noreferrer" className="text-[#1d9bf0] hover:underline">
                  github.com
                </a>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span>Joined August 2026</span>
              </div>
            </div>

            {/* Followers / Following Stats */}
            <div className="flex items-center space-x-4 text-xs sm:text-sm pt-1">
              <div className="hover:underline cursor-pointer">
                <span className="font-bold text-white">142</span>{' '}
                <span className="text-gray-500">Following</span>
              </div>
              <div className="hover:underline cursor-pointer">
                <span className="font-bold text-white">1.2K</span>{' '}
                <span className="text-gray-500">Followers</span>
              </div>
            </div>
          </div>

          {/* Profile Navigation Tabs */}
          <div className="flex border-b border-[#2f3336]">
            {['posts', 'replies', 'highlights', 'media', 'likes'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 text-center py-3.5 font-bold text-xs sm:text-sm capitalize relative hover:bg-[#181818] transition-colors cursor-pointer ${
                  activeTab === tab ? 'text-white' : 'text-gray-500'
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-[#1d9bf0] rounded-full"></div>
                )}
              </button>
            ))}
          </div>

          {/* Tab Content Stream */}
          <PostList
            posts={posts}
            onLike={handleLike}
            onRetweet={handleRetweet}
            onBookmark={handleBookmark}
            onShare={handleShare}
          />

        </main>

        {/* Right Sidebar */}
        <RightSidebar
          trends={trends}
          whoToFollow={whoToFollow}
          onToggleFollow={handleToggleFollow}
        />

      </div>
    </div>
  );
};

export default Profile;
