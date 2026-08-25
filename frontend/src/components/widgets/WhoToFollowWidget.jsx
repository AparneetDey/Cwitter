import React, { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { getAvatarUrl } from '../../utils/constants';
import { WhoToFollowWidgetSkeleton } from './WidgetSkeleton';

const INITIAL_WHO_TO_FOLLOW = [
  { id: 'suggested_1', fullName: 'Alex Rivera', username: 'alexrivera', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', verified: true, isFollowing: false },
  { id: 'suggested_2', fullName: 'Elena Rostova', username: 'elena_tech', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80', verified: true, isFollowing: false },
  { id: 'suggested_3', fullName: 'DevPulse Community', username: 'devpulse', avatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150&auto=format&fit=crop&q=80', verified: false, isFollowing: false },
];

const WhoToFollowWidget = ({ accounts: externalAccounts, onToggleFollow: externalToggleFollow, loading = false }) => {
  const [internalAccounts, setInternalAccounts] = useState(INITIAL_WHO_TO_FOLLOW);

  const accountsList = externalAccounts || internalAccounts;

  const handleToggle = (id) => {
    if (externalToggleFollow) {
      externalToggleFollow(id);
    } else {
      setInternalAccounts((prev) =>
        prev.map((item) =>
          (item.id === id || item._id === id) ? { ...item, isFollowing: !item.isFollowing } : item
        )
      );
    }
  };

  if (loading || !accountsList) {
    return <WhoToFollowWidgetSkeleton count={3} />;
  }

  return (
    <div className="cwitter-widget-card">
      <h3 className="font-bold text-lg text-white">Who to follow</h3>

      <div className="flex flex-col gap-3 pt-1">
        {accountsList.map((item) => {
          const itemId = item.id || item._id;
          return (
            <div key={itemId} className="flex items-center justify-between hover:bg-[#1f2226] p-2 rounded-xl transition-colors">
              <div className="flex items-center space-x-3">
                <img src={getAvatarUrl(item.avatar)} alt={item.fullName} className="w-10 h-10 rounded-full object-cover bg-[#16181c]" />
                <div className="flex flex-col text-sm">
                  <div className="flex items-center space-x-1">
                    <span className="font-bold text-white hover:underline">{item.fullName}</span>
                    {item.verified && <CheckCircle2 className="w-3.5 h-3.5 text-[#1d9bf0]" />}
                  </div>
                  <span className="text-gray-500 text-xs">@{item.username}</span>
                </div>
              </div>

              <button
                onClick={() => handleToggle(itemId)}
                className={`px-4 py-1.5 rounded-full font-bold text-xs transition-all cursor-pointer ${
                  item.isFollowing
                    ? 'bg-transparent border border-[#2f3336] text-white hover:border-red-600 hover:text-red-500'
                    : 'cwitter-btn-secondary !px-4 !py-1.5 !text-xs'
                }`}
              >
                {item.isFollowing ? 'Following' : 'Follow'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WhoToFollowWidget;
