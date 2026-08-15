import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { getAvatarUrl } from '../../utils/constants';

const WhoToFollowWidget = ({ accounts, onToggleFollow }) => {
  return (
    <div className="cwitter-widget-card">
      <h3 className="font-bold text-lg text-white">Who to follow</h3>

      <div className="flex flex-col gap-3 pt-1">
        {accounts.map((item) => (
          <div key={item.id} className="flex items-center justify-between hover:bg-[#1f2226] p-2 rounded-xl transition-colors">
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
              onClick={() => onToggleFollow(item.id)}
              className={`px-4 py-1.5 rounded-full font-bold text-xs transition-all cursor-pointer ${
                item.isFollowing
                  ? 'bg-transparent border border-[#2f3336] text-white hover:border-red-600 hover:text-red-500'
                  : 'cwitter-btn-secondary !px-4 !py-1.5 !text-xs'
              }`}
            >
              {item.isFollowing ? 'Following' : 'Follow'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WhoToFollowWidget;
