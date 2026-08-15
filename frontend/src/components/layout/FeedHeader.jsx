import React from 'react';
import { Sparkles } from 'lucide-react';

const FeedHeader = ({ activeTab, setActiveTab }) => {
  return (
    <header className="sticky top-0 bg-black/80 backdrop-blur-md z-30 border-b border-[#2f3336]">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#2f3336]/40">
        <h2 className="text-xl font-bold text-white">Home</h2>
        <Sparkles className="w-5 h-5 text-[#1d9bf0] cursor-pointer hover:opacity-80" />
      </div>

      <div className="flex">
        <button
          onClick={() => setActiveTab('forYou')}
          className={`flex-1 text-center py-3.5 font-bold text-sm relative hover:bg-[#181818] transition-colors cursor-pointer ${
            activeTab === 'forYou' ? 'text-white' : 'text-gray-500'
          }`}
        >
          For you
          {activeTab === 'forYou' && (
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-[#1d9bf0] rounded-full"></div>
          )}
        </button>

        <button
          onClick={() => setActiveTab('following')}
          className={`flex-1 text-center py-3.5 font-bold text-sm relative hover:bg-[#181818] transition-colors cursor-pointer ${
            activeTab === 'following' ? 'text-white' : 'text-gray-500'
          }`}
        >
          Following
          {activeTab === 'following' && (
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-[#1d9bf0] rounded-full"></div>
          )}
        </button>
      </div>
    </header>
  );
};

export default FeedHeader;
