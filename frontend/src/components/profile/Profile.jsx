import React, { useCallback, useEffect, useState } from 'react';
import { useOutletContext, useNavigate, useParams } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import PostList from '../post/PostList';
import UserList from './UserList';
import UserListSkeleton from './UserListSkeleton';
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

const Profile = () => {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const { showToast } = useOutletContext() || {};
  const { formatDate, formatNumber } = useFormatter();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('posts');
  const [tabLoading, setTabLoading] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cached tab state (null means not loaded yet)
  const [posts, setPosts] = useState(null);
  const [followersList, setFollowersList] = useState(null);
  const [followingList, setFollowingList] = useState(null);

  const isOwnProfile = currentUser?._id && (String(currentUser._id) === String(user?._id) || String(currentUser._id) === String(userId));

  const triggerToast = useCallback((msg) => {
    if (showToast) showToast(msg);
  }, [showToast]);

  // Fetch Profile Overview Dashboard
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

  // Fetch User Posts / Tweets
  const getUserTweets = useCallback(async () => {
    setTabLoading(true);
    try {
      const res = await api.get(`tweets/user/${userId}`);
      const data = res.data;
      setPosts(data.data.tweets || []);
    } catch (error) {
      if (showToast) showToast(error?.response?.data?.message || "Failed to fetch posts");
      setPosts([]);
    } finally {
      setTabLoading(false);
    }
  }, [userId, showToast]);

  // Fetch User Followers
  const getUserFollowers = useCallback(async () => {
    setTabLoading(true);
    try {
      const res = await api.get(`follows/followers/${userId}`);
      const data = res.data;
      setFollowersList(data.data.followers || []);
    } catch (error) {
      if (showToast) showToast(error?.response?.data?.message || "Failed to fetch followers");
      setFollowersList([]);
    } finally {
      setTabLoading(false);
    }
  }, [userId, showToast]);

  // Fetch User Followings
  const getUserFollowings = useCallback(async () => {
    setTabLoading(true);
    try {
      const res = await api.get(`follows/followings/${userId}`);
      const data = res.data;
      setFollowingList(data.data.followings || []);
    } catch (error) {
      if (showToast) showToast(error?.response?.data?.message || "Failed to fetch followings");
      setFollowingList([]);
    } finally {
      setTabLoading(false);
    }
  }, [userId, showToast]);

  // Load dashboard overview when userId changes & reset tab caches
  useEffect(() => {
    setPosts(null);
    setFollowersList(null);
    setFollowingList(null);
    setActiveTab('posts');
    getUserDashboard();
  }, [userId, getUserDashboard]);

  // Optimized lazy-fetching: fetch data for activeTab ONLY if not already fetched
  useEffect(() => {
    if (activeTab === 'posts' && posts === null) {
      getUserTweets();
    } else if (activeTab === 'followers' && followersList === null) {
      getUserFollowers();
    } else if (activeTab === 'following' && followingList === null) {
      getUserFollowings();
    }
  }, [activeTab, posts, followersList, followingList, getUserTweets, getUserFollowers, getUserFollowings]);

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
  };

  // Toggle follow status directly on the target user profile page
  const handleToggleProfileFollow = async () => {
    if (!user) return;
    const targetUserId = user._id || userId;
    const nextIsFollowing = !user.isFollowing;

    // Instant optimistic update
    setUser((prev) =>
      prev
        ? {
            ...prev,
            isFollowing: nextIsFollowing,
            totalFollowers: nextIsFollowing
              ? (prev.totalFollowers || 0) + 1
              : Math.max(0, (prev.totalFollowers || 0) - 1),
          }
        : prev
    );

    try {
      const res = await api.get(`/follows/${targetUserId}`);
      const message = res?.data?.message || (nextIsFollowing ? `You followed @${user.username}` : `Unfollowed @${user.username}`);
      triggerToast(message);
    } catch (error) {
      // Revert on failure
      setUser((prev) =>
        prev
          ? {
              ...prev,
              isFollowing: !nextIsFollowing,
              totalFollowers: !nextIsFollowing
                ? (prev.totalFollowers || 0) + 1
                : Math.max(0, (prev.totalFollowers || 0) - 1),
            }
          : prev
      );
      triggerToast(error?.response?.data?.message || 'Failed to toggle follow');
    }
  };

  // Real-time API toggle follow / unfollow for user card list
  const handleToggleUserFollow = async (targetUserId) => {
    // 1. Instant optimistic local UI update
    setFollowersList((prev) =>
      prev
        ? prev.map((item) =>
            String(item._id || item.id) === String(targetUserId)
              ? { ...item, isFollowing: !item.isFollowing }
              : item
          )
        : null
    );

    setFollowingList((prev) =>
      prev
        ? prev.map((item) =>
            String(item._id || item.id) === String(targetUserId)
              ? { ...item, isFollowing: !item.isFollowing }
              : item
          )
        : null
    );

    // 2. Async backend API call
    try {
      const res = await api.get(`/follows/${targetUserId}`);
      const message = res?.data?.message || 'Updated follow status';
      triggerToast(message);
    } catch (error) {
      // Revert optimistic update on error
      setFollowersList((prev) =>
        prev
          ? prev.map((item) =>
              String(item._id || item.id) === String(targetUserId)
                ? { ...item, isFollowing: !item.isFollowing }
                : item
            )
          : null
      );
      setFollowingList((prev) =>
        prev
          ? prev.map((item) =>
              String(item._id || item.id) === String(targetUserId)
                ? { ...item, isFollowing: !item.isFollowing }
                : item
            )
          : null
      );
      triggerToast(error?.response?.data?.message || 'Failed to toggle follow');
    }
  };

  const handleLike = (postId) => {
    if (!posts) return;
    setPosts(
      posts.map((post) => {
        if (post.id === postId || post._id === postId) {
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
    if (!posts) return;
    setPosts(
      posts.map((post) => {
        if (post.id === postId || post._id === postId) {
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
    if (!posts) return;
    setPosts(
      posts.map((post) => {
        if (post.id === postId || post._id === postId) {
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

  // Render tab stream content cleanly
  const renderTabContent = () => {
    if (tabLoading) {
      if (activeTab === 'followers' || activeTab === 'following') {
        return <UserListSkeleton count={4} />;
      }
      return <PostList loading={true} />;
    }

    switch (activeTab) {
      case 'followers':
        return (
          <UserList
            users={followersList}
            onToggleFollow={handleToggleUserFollow}
            emptyMessage="No followers yet."
          />
        );
      case 'following':
        return (
          <UserList
            users={followingList}
            onToggleFollow={handleToggleUserFollow}
            emptyMessage="Not following anyone yet."
          />
        );
      case 'posts':
        return (
          <PostList
            posts={posts}
            onLike={handleLike}
            onRetweet={handleRetweet}
            onBookmark={handleBookmark}
            onShare={handleShare}
          />
        );
      default:
        return (
          <div className="p-12 text-center text-gray-500 text-sm">
            No {activeTab} yet.
          </div>
        );
    }
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
            <p className="text-gray-500 text-xs">{posts?.length || 0} Posts</p>
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
            {isOwnProfile ? (
              <>
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
              </>
            ) : (
              <button
                onClick={handleToggleProfileFollow}
                className={`px-5 py-2 rounded-full font-bold text-sm transition-all cursor-pointer ${
                  user?.isFollowing
                    ? 'bg-transparent border border-[#2f3336] text-white hover:border-red-600 hover:text-red-500'
                    : 'cwitter-btn-secondary !px-5 !py-2 !text-sm'
                }`}
              >
                {user?.isFollowing ? 'Following' : 'Follow'}
              </button>
            )}
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

          {/* Followers / Following Stats - Clickable to switch tabs */}
          <div className="flex items-center space-x-4 text-xs sm:text-sm pt-1">
            <button
              type="button"
              onClick={() => handleTabChange('following')}
              className="hover:underline cursor-pointer flex items-center space-x-1 text-left"
            >
              <span className="font-bold text-white">{formatNumber(user?.totalFollowings || 0)}</span>
              <span className="text-gray-500">Following</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange('followers')}
              className="hover:underline cursor-pointer flex items-center space-x-1 text-left"
            >
              <span className="font-bold text-white">{formatNumber(user?.totalFollowers || 0)}</span>
              <span className="text-gray-500">Followers</span>
            </button>
          </div>
        </div>

        {/* Profile Navigation Tabs */}
        <div className="flex border-b border-[#2f3336] overflow-x-auto no-scrollbar">
          {['posts', 'followers', 'following', 'replies', 'likes'].map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`flex-1 text-center py-3.5 font-bold text-xs sm:text-sm capitalize relative hover:bg-[#181818] transition-colors cursor-pointer shrink-0 px-3 ${
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

        {/* Clean Tab Stream Content */}
        {renderTabContent()}

      </main>
    </>
  );
};

export default Profile;
