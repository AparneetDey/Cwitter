import React from 'react';
import { useNavigate } from 'react-router';
import { CheckCircle2 } from 'lucide-react';
import { getAvatarUrl } from '../../utils/constants';
import UserListSkeleton from './UserListSkeleton';

const UserList = ({ users, loading,  onToggleFollow, emptyMessage = 'No users found.' }) => {
  const navigate = useNavigate();

  if(loading) {
    return <UserListSkeleton count={4} />;
  }

  if (!users || users.length === 0) {
    return (
      <div className="p-12 text-center text-gray-500 text-sm">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="divide-y divide-[#2f3336]">
      {users.map((user) => (
        <div
          key={user._id || user.id}
          onClick={() => navigate(`/profile/${user._id || user.id}`)}
          className="p-4 border-b border-[#2f3336] bg-black hover:bg-[#080808] transition-colors flex items-start justify-between gap-3 cursor-pointer"
        >
          {/* Avatar & User Details */}
          <div className="flex items-start space-x-3 flex-1 min-w-0">
            <img
              src={getAvatarUrl(user.avatar)}
              alt={user.fullName}
              className="w-11 h-11 rounded-full object-cover shrink-0 bg-[#16181c] border border-[#2f3336]"
            />

            <div className="flex flex-col min-w-0 flex-1">
              {/* Full Name & Verified Badge */}
              <div className="flex items-center space-x-1.5 truncate">
                <span className="font-bold text-white hover:underline text-sm truncate">
                  {user.fullName}
                </span>
                {user.isVerified && (
                  <CheckCircle2 className="w-4 h-4 text-[#1d9bf0] shrink-0" title="Verified Account" />
                )}
              </div>

              {/* Username */}
              <span className="text-gray-500 text-xs truncate">@{user.username}</span>

              {/* Bio / Description */}
              {user.description && (
                <p className="text-[#e7e9ea] text-xs mt-1.5 line-clamp-2 leading-relaxed">
                  {user.description}
                </p>
              )}
            </div>
          </div>

          {/* Follow / Unfollow Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFollow(user._id || user.id);
            }}
            className={`px-4 py-1.5 rounded-full font-bold text-xs transition-all cursor-pointer shrink-0 mt-0.5 ${
              user.isFollowing
                ? 'bg-transparent border border-[#2f3336] text-white hover:border-red-600 hover:text-red-500'
                : 'cwitter-btn-secondary !px-4 !py-1.5 !text-xs'
            }`}
          >
            {user.isFollowing ? 'Following' : 'Follow'}
          </button>
        </div>
      ))}
    </div>
  );
};

export default UserList;
