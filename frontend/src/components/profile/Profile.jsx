import React, { useCallback, useEffect, useState } from 'react';
import { useOutletContext, useNavigate, useParams } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import PostList from '../post/PostList';
import UserList from './UserList';
import UserListSkeleton from './UserListSkeleton';
import EditProfileModal from './EditProfileModal';
import ChangePasswordModal from './ChangePasswordModal';
import VerificationModal from './VerificationModal';
import ProfileSkeleton from './ProfileSkeleton';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  CheckCircle2,
  Edit3,
  ShieldCheck,
  Image as ImageIcon
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
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cached tab state (null means not loaded yet)
  const [posts, setPosts] = useState(null);
  const [postsPage, setPostsPage] = useState(1);
  const [postsHasNext, setPostsHasNext] = useState(false);
  const [loadingMorePosts, setLoadingMorePosts] = useState(false);

  const [mediaList, setMediaList] = useState(null);
  const [mediaPage, setMediaPage] = useState(1);
  const [mediaHasNext, setMediaHasNext] = useState(false);
  const [loadingMoreMedia, setLoadingMoreMedia] = useState(false);

  const [followersList, setFollowersList] = useState(null);
  const [followersPage, setFollowersPage] = useState(1);
  const [followersHasNext, setFollowersHasNext] = useState(false);
  const [loadingMoreFollowers, setLoadingMoreFollowers] = useState(false);

  const [followingList, setFollowingList] = useState(null);
  const [followingPage, setFollowingPage] = useState(1);
  const [followingHasNext, setFollowingHasNext] = useState(false);
  const [loadingMoreFollowing, setLoadingMoreFollowing] = useState(false);

  const [likedTweets, setLikedTweets] = useState(null);
  const [likedTweetsPage, setLikedTweetsPage] = useState(1);
  const [likedTweetsHasNext, setLikedTweetsHasNext] = useState(false);
  const [loadingMoreLikedTweets, setLoadingMoreLikedTweets] = useState(false);

  const isOwnProfile = currentUser?._id && (String(currentUser._id) === String(user?._id) || String(currentUser._id) === String(userId));

  const triggerToast = (msg) => {
    if (showToast && typeof showToast === 'function') {
      showToast(msg);
    }
  };

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
  const getUserTweets = useCallback(async (pageToFetch = 1) => {
    if (pageToFetch === 1) {
      setTabLoading(true);
    } else {
      setLoadingMorePosts(true);
    }

    try {
      const res = await api.get(`tweets/user/${userId}?page=${pageToFetch}&limit=15`);
      const data = res.data?.data;
      const docs = data?.tweets || [];
      const hasNext = Boolean(data?.hasNextPage);

      if (pageToFetch === 1) {
        setPosts(docs);
      } else {
        setPosts((prev) => [...(prev || []), ...docs]);
      }

      setPostsHasNext(hasNext);
      setPostsPage(pageToFetch);
    } catch (error) {
      if (showToast) showToast(error?.response?.data?.message || "Failed to fetch posts");
      if (pageToFetch === 1) setPosts([]);
    } finally {
      setTabLoading(false);
      setLoadingMorePosts(false);
    }
  }, [userId, showToast]);

  // Fetch User Media URLs from /medias/user/:userId
  const getUserMediaList = useCallback(async (pageToFetch = 1) => {
    if (pageToFetch === 1) {
      setTabLoading(true);
    } else {
      setLoadingMoreMedia(true);
    }

    try {
      const res = await api.get(`medias/user/${userId}?page=${pageToFetch}&limit=15`);
      const data = res.data?.data;
      const docs = data?.medias || [];
      const hasNext = Boolean(data?.hasNextPage);

      if (pageToFetch === 1) {
        setMediaList(docs);
      } else {
        setMediaList((prev) => [...(prev || []), ...docs]);
      }

      setMediaHasNext(hasNext);
      setMediaPage(pageToFetch);
    } catch (error) {
      if (showToast) showToast(error?.response?.data?.message || "Failed to fetch user media");
      if (pageToFetch === 1) setMediaList([]);
    } finally {
      setTabLoading(false);
      setLoadingMoreMedia(false);
    }
  }, [userId, showToast]);

  // Fetch User Followers
  const getUserFollowers = useCallback(async (pageToFetch = 1) => {
    if (pageToFetch === 1) {
      setTabLoading(true);
    } else {
      setLoadingMoreFollowers(true);
    }

    try {
      const res = await api.get(`follows/followers/${userId}?page=${pageToFetch}&limit=10`);
      const data = res.data?.data;
      const docs = data?.followers || [];
      const hasNext = Boolean(data?.hasNextPage);

      if (pageToFetch === 1) {
        setFollowersList(docs);
      } else {
        setFollowersList((prev) => [...(prev || []), ...docs]);
      }

      setFollowersHasNext(hasNext);
      setFollowersPage(pageToFetch);
    } catch (error) {
      if (showToast) showToast(error?.response?.data?.message || "Failed to fetch followers");
      if (pageToFetch === 1) setFollowersList([]);
    } finally {
      setTabLoading(false);
      setLoadingMoreFollowers(false);
    }
  }, [userId, showToast]);

  // Fetch User Followings
  const getUserFollowings = useCallback(async (pageToFetch = 1) => {
    if (pageToFetch === 1) {
      setTabLoading(true);
    } else {
      setLoadingMoreFollowing(true);
    }

    try {
      const res = await api.get(`follows/followings/${userId}?page=${pageToFetch}&limit=10`);
      const data = res.data?.data;
      const docs = data?.followings || [];
      const hasNext = Boolean(data?.hasNextPage);

      if (pageToFetch === 1) {
        setFollowingList(docs);
      } else {
        setFollowingList((prev) => [...(prev || []), ...docs]);
      }

      setFollowingHasNext(hasNext);
      setFollowingPage(pageToFetch);
    } catch (error) {
      if (showToast) showToast(error?.response?.data?.message || "Failed to fetch followings");
      if (pageToFetch === 1) setFollowingList([]);
    } finally {
      setTabLoading(false);
      setLoadingMoreFollowing(false);
    }
  }, [userId, showToast]);

  // Fetch User Liked Tweets from /likes/user/:userId
  const getUserLikedTweetsList = useCallback(async (pageToFetch = 1) => {
    if (pageToFetch === 1) {
      setTabLoading(true);
    } else {
      setLoadingMoreLikedTweets(true);
    }

    try {
      const res = await api.get(`likes/user/${userId}?page=${pageToFetch}&limit=15`);
      const data = res.data?.data;
      const docs = data?.likedTweets || [];
      const hasNext = Boolean(data?.hasNextPage);

      if (pageToFetch === 1) {
        setLikedTweets(docs);
      } else {
        setLikedTweets((prev) => [...(prev || []), ...docs]);
      }

      setLikedTweetsHasNext(hasNext);
      setLikedTweetsPage(pageToFetch);
    } catch (error) {
      if (showToast) showToast(error?.response?.data?.message || "Failed to fetch liked tweets");
      if (pageToFetch === 1) setLikedTweets([]);
    } finally {
      setTabLoading(false);
      setLoadingMoreLikedTweets(false);
    }
  }, [userId, showToast]);

  // Load dashboard overview when userId changes & reset tab caches
  useEffect(() => {
    setPosts(null);
    setMediaList(null);
    setFollowersList(null);
    setFollowingList(null);
    setLikedTweets(null);
    setActiveTab('posts');
    getUserDashboard();
  }, [userId, getUserDashboard]);

  // Optimized lazy-fetching: fetch data for activeTab ONLY if not already fetched
  useEffect(() => {
    if (activeTab === 'posts' && posts === null) {
      getUserTweets(1);
    } else if (activeTab === 'media' && mediaList === null) {
      getUserMediaList(1);
    } else if (activeTab === 'followers' && followersList === null) {
      getUserFollowers(1);
    } else if (activeTab === 'following' && followingList === null) {
      getUserFollowings(1);
    } else if (activeTab === 'likes' && likedTweets === null) {
      getUserLikedTweetsList(1);
    }
  }, [activeTab, posts, mediaList, followersList, followingList, likedTweets, getUserTweets, getUserMediaList, getUserFollowers, getUserFollowings, getUserLikedTweetsList]);

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
            loadingMore={loadingMoreFollowers}
            hasNextPage={followersHasNext}
            onLoadMore={() => getUserFollowers(followersPage + 1)}
            onToggleFollow={handleToggleUserFollow}
            emptyMessage="No followers yet."
          />
        );
      case 'following':
        return (
          <UserList
            users={followingList}
            loadingMore={loadingMoreFollowing}
            hasNextPage={followingHasNext}
            onLoadMore={() => getUserFollowings(followingPage + 1)}
            onToggleFollow={handleToggleUserFollow}
            emptyMessage="Not following anyone yet."
          />
        );
      case 'posts':
        return (
          <PostList
            posts={posts}
            setPosts={setPosts}
            loadingMore={loadingMorePosts}
            hasNextPage={postsHasNext}
            onLoadMore={() => getUserTweets(postsPage + 1)}
          />
        );
      case 'likes':
        return (
          <PostList
            posts={likedTweets}
            setPosts={setLikedTweets}
            loadingMore={loadingMoreLikedTweets}
            hasNextPage={likedTweetsHasNext}
            onLoadMore={() => getUserLikedTweetsList(likedTweetsPage + 1)}
            emptyMessage={`@${user?.username || 'user'} hasn't liked any posts yet.`}
          />
        );
      case 'media':
        if (!mediaList || mediaList.length === 0) {
          return (
            <div className="flex flex-col items-center justify-center px-6 py-20 text-center max-w-sm mx-auto select-none">
              <div className="w-16 h-16 rounded-full bg-[#1d9bf0]/10 flex items-center justify-center text-[#1d9bf0] mb-6 border border-[#1d9bf0]/20">
                <ImageIcon className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Lights, camera... attachment!</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                When @{user?.username} posts photos or videos, they will show up here.
              </p>
            </div>
          );
        }
        return (
          <div className="p-2 bg-black">
            <div className="grid grid-cols-3 gap-1.5">
              {mediaList.map((item, idx) => {
                const url = typeof item === 'string' ? item : item.url;
                const tweetId = typeof item === 'object' ? (item.tweetId || item.tweet?._id) : null;
                const isVideo = url?.match(/\.(mp4|webm|mov)$/i);

                return (
                  <div
                    key={item._id || idx}
                    onClick={() => {
                      if (tweetId) navigate(`/post/${tweetId}`);
                    }}
                    className="relative aspect-square rounded-xl overflow-hidden bg-[#16181c] group cursor-pointer hover:opacity-90 transition-all border border-[#2f3336]/40"
                  >
                    {isVideo ? (
                      <video src={url} className="w-full h-full object-cover" />
                    ) : (
                      <img src={url} alt={`user media ${idx + 1}`} className="w-full h-full object-cover" />
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-xs font-bold text-white bg-black/75 backdrop-blur-xs px-3 py-1 rounded-full border border-white/20">
                        View Post
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
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
    <div className="w-full max-w-150 border-r border-[#2f3336] min-h-screen flex flex-col">
      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        showToast={triggerToast}
      />

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={user}
        showToast={triggerToast}
        onOpenPasswordModal={() => setIsPasswordModalOpen(true)}
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

      {/* Sticky Header with Back Button & Post Count */}
      <header className="sticky top-0 z-30 bg-black/80 backdrop-blur-md border-b border-[#2f3336] px-4 py-2 flex items-center space-x-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full hover:bg-[#181818] transition-colors cursor-pointer text-white"
          title="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex flex-col">
          <div className="flex items-center space-x-1.5">
            <h1 className="font-bold text-lg text-white leading-snug">{user?.fullName}</h1>
            {user?.isVerified && (
              <CheckCircle2 className="w-4 h-4 text-[#1d9bf0] shrink-0" />
            )}
          </div>
          <span className="text-xs text-gray-500 font-medium">
            {formatNumber(user?.totalTweets || 0)} posts
          </span>
        </div>
      </header>

      <main className="w-full pb-20">
        {/* Cover Photo / Banner */}
        <div className="h-36 sm:h-48 bg-[#202327] relative w-full overflow-hidden">
          {user?.coverImage ? (
            <img src={user.coverImage} alt="cover banner" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-[#15202b] via-[#1d9bf0]/20 to-[#15202b]" />
          )}
        </div>

        {/* Profile Info Header Bar */}
        <div className="px-4 pb-4 border-b border-[#2f3336] relative space-y-3">
          {/* Avatar & Action Buttons Row */}
          <div className="flex items-end justify-between -mt-16 sm:-mt-20 mb-3">
            <div className="relative">
              <img
                src={getAvatarUrl(user?.avatar)}
                alt={user?.fullName}
                className="w-28 h-28 sm:w-36 sm:h-36 rounded-full border-4 border-black object-cover bg-[#16181c]"
              />
            </div>

            {/* Profile Action Buttons */}
            <div className="flex items-center space-x-2">
              {isOwnProfile ? (
                <>
                  {!user?.isVerified && (
                    <button
                      onClick={() => setIsVerificationModalOpen(true)}
                      className="px-3.5 py-1.5 rounded-full border border-[#1d9bf0]/50 text-[#1d9bf0] hover:bg-[#1d9bf0]/10 font-bold text-xs transition-colors flex items-center space-x-1.5 cursor-pointer shadow-xs"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Get Verified</span>
                    </button>
                  )}
                  <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="px-4 py-1.5 rounded-full border border-[#536471] text-white font-bold text-xs sm:text-sm hover:bg-[#181818] transition-colors flex items-center space-x-1.5 cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Edit profile</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={handleToggleProfileFollow}
                  className={`px-5 py-1.5 rounded-full font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-md ${
                    user?.isFollowing
                      ? 'border border-[#536471] text-white hover:bg-red-600/10 hover:border-red-600 hover:text-red-500'
                      : 'bg-white text-black hover:bg-gray-200'
                  }`}
                >
                  {user?.isFollowing ? 'Following' : 'Follow'}
                </button>
              )}
            </div>
          </div>

          {/* User Details */}
          <div>
            <div className="flex items-center space-x-1.5">
              <h2 className="text-xl font-extrabold text-white leading-tight">{user?.fullName}</h2>
              {user?.isVerified && (
                <CheckCircle2 className="w-5 h-5 text-[#1d9bf0] shrink-0" />
              )}
            </div>
            <p className="text-gray-500 text-sm">@{user?.username}</p>
          </div>

          {/* Bio */}
          {user?.bio && (
            <p className="text-[#e7e9ea] text-sm leading-normal whitespace-pre-line pt-1">
              {user.bio}
            </p>
          )}

          {/* Metadata Row (Location, Website, Github, Joined Date) */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:text-sm text-gray-500 pt-1">
            {user?.location && (
              <div className="flex items-center space-x-1">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span>{user.location}</span>
              </div>
            )}

            {user?.website && (
              <div className="flex items-center space-x-1">
                <GithubIcon className="w-4 h-4 text-gray-500 shrink-0" />
                <a
                  href={user.website.startsWith('http') ? user.website : `https://${user.website}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#1d9bf0] hover:underline"
                >
                  {user.website.replace(/^https?:\/\//, '')}
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
        <div className="flex border-b border-[#2f3336] overflow-x-auto scrollbar-none">
          {[
            { id: 'posts', label: 'Posts' },
            { id: 'media', label: 'Media' },
            { id: 'followers', label: 'Followers' },
            { id: 'following', label: 'Following' },
            { id: 'replies', label: 'Replies' },
            { id: 'likes', label: 'Likes' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex-1 text-center py-3.5 font-bold text-xs sm:text-sm relative hover:bg-[#181818] transition-colors cursor-pointer shrink-0 px-3 min-w-[75px] ${
                activeTab === tab.id ? 'text-white font-extrabold' : 'text-gray-500'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-[#1d9bf0] rounded-full"></div>
              )}
            </button>
          ))}
        </div>

        {/* Clean Tab Stream Content */}
        {renderTabContent()}

      </main>
    </div>
  );
};

export default Profile;
