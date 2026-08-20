import React, { useCallback, useEffect, useState } from 'react';
import { useOutletContext, useNavigate, useParams } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import PostList from '../post/PostList';
import EditProfileModal from './EditProfileModal';
import VerificationModal from './VerificationModal';
import ProfileSkeleton from './ProfileSkeleton';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  CheckCircle2,
  Edit3,
  ShieldCheck
} from 'lucide-react';
import { getAvatarUrl } from '../../utils/constants';
import GithubIcon from '../../elements/GithubIcon';
import api from '../../utils/axiosApi.util';
import useFormatter from '../../hooks/useFormatter';

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

const Profile = () => {
  const { userId } = useParams();
  const { showToast } = useOutletContext() || {};
  const { formatDate, formatNumber } = useFormatter();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('posts');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [posts, setPosts] = useState(INITIAL_USER_POSTS);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const getUserDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/users/dashboard/${userId}`);
      const data = res.data;
      setUser(data.data);
    } catch (error) {
      if (showToast) showToast(error?.response?.data?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, [userId, showToast]);

  useEffect(() => {
    getUserDashboard();
  }, [userId, getUserDashboard]);

  const triggerToast = (msg) => {
    if (showToast) showToast(msg);
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
          triggerToast(isBookmarked ? 'Added to your Bookmarks' : 'Removed from Bookmarks');
          return { ...post, isBookmarked };
        }
        return post;
      })
    );
  };

  const handleShare = () => {
    triggerToast('Post link copied to clipboard!');
  };

  if (loading || !user) {
    return <ProfileSkeleton />;
  }

  return (
    <>
      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={user}
        onProfileUpdated={() => {
          getUserDashboard();
          triggerToast('Profile updated successfully!');
        }}
      />

      {/* Account Verification Modal */}
      <VerificationModal
        isOpen={isVerificationModalOpen}
        onClose={() => setIsVerificationModalOpen(false)}
        user={user}
        onVerifiedSuccess={() => {
          getUserDashboard();
          triggerToast('Account verified successfully! 🎉');
        }}
      />

      {/* Center Profile View */}
      <main className="w-full max-w-150 border-r border-[#2f3336] bg-black min-h-screen pb-16">
        
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
              <span>{user?.fullName}</span>
              {user?.isVerified && (
                <CheckCircle2 className="w-4 h-4 text-[#1d9bf0] shrink-0" title="Verified Account" />
              )}
            </h2>
            <p className="text-gray-500 text-xs">{posts.length} Posts</p>
          </div>
        </header>

        {/* Cover Image Banner */}
        <div className="h-48 sm:h-56 bg-[#16181c] relative overflow-hidden">
          {user?.coverImage ? (
            <img
              src={user.coverImage}
              alt="cover"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-linear-to-r from-[#1d9bf0]/40 via-[#7928ca]/30 to-[#00d2ff]/40"></div>
          )}
        </div>

        {/* Avatar & Action Buttons Bar */}
        <div className="px-4 pb-4 flex justify-between items-end relative">
          {/* Avatar */}
          <div className="-mt-16 sm:-mt-20 relative">
            <img
              src={getAvatarUrl(user?.avatar)}
              alt="avatar"
              className="w-28 h-28 sm:w-36 sm:h-36 rounded-full object-cover border-4 border-black bg-[#16181c]"
            />
          </div>

          {/* Profile Action Buttons */}
          <div className="flex items-center space-x-2">
            {!user?.isVerified && (
              <button
                onClick={() => setIsVerificationModalOpen(true)}
                className="bg-[#1d9bf0]/10 hover:bg-[#1d9bf0]/20 border border-[#1d9bf0]/40 text-[#1d9bf0] font-bold px-4 py-2 rounded-full transition-all text-sm cursor-pointer flex items-center space-x-1.5"
                title="Verify your Cwitter account"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Get Verified</span>
              </button>
            )}
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="cwitter-btn-outline"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit profile</span>
            </button>
          </div>
        </div>

        {/* User Information Details */}
        <div className="px-4 space-y-3.5 border-b border-[#2f3336] pb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center space-x-1.5">
              <span>{user?.fullName}</span>
              {user?.isVerified && (
                <CheckCircle2 className="w-5 h-5 text-[#1d9bf0] shrink-0" title="Verified Account" />
              )}
            </h1>
            <p className="text-gray-500 text-sm">@{user?.username}</p>
          </div>

          {/* Bio / Description */}
          <p className="text-[#e7e9ea] text-sm leading-relaxed">
            {user?.description || 'No description provided.'}
          </p>

          {/* Metadata (Location, GitHub & Joined Date) */}
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-gray-500 pt-1">
            <div className="flex items-center space-x-1">
              <MapPin className="w-4 h-4 text-gray-500" />
              <span>{user?.location || 'Earth'}</span>
            </div>

            {user?.githubLink && (
              <div className="flex items-center space-x-1">
                <GithubIcon className="w-4 h-4 text-gray-500" />
                <a
                  href={user.githubLink.startsWith('http') ? user.githubLink : `https://${user.githubLink}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#1d9bf0] hover:underline"
                >
                  {user.githubLink.replace(/^https?:\/\//, '').replace("github.com/", "")}
                </a>
              </div>
            )}

            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span>Joined {formatDate(user?.createdAt)}</span>
            </div>
          </div>

          {/* Followers / Following Stats */}
          <div className="flex items-center space-x-4 text-xs sm:text-sm pt-1">
            <div className="hover:underline cursor-pointer">
              <span className="font-bold text-white">{formatNumber(user?.totalFollowings)}</span>{' '}
              <span className="text-gray-500">Following</span>
            </div>
            <div className="hover:underline cursor-pointer">
              <span className="font-bold text-white">{formatNumber(user?.totalFollowers)}</span>{' '}
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
    </>
  );
};

export default Profile;
