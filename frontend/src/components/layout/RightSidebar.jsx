import React from 'react';
import { Search } from 'lucide-react';
import TrendingWidget from '../widgets/TrendingWidget';
import WhoToFollowWidget from '../widgets/WhoToFollowWidget';

const RightSidebar = ({ trends, whoToFollow, onToggleFollow }) => {
  return (
    <aside className="hidden lg:flex flex-col gap-4 w-80 xl:w-90 p-4 sticky top-0 h-screen overflow-y-auto select-none shrink-0">
      
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-4 top-3.5 w-4 h-4 text-gray-500" />
        <input
          type="text"
          placeholder="Search Cwitter"
          className="w-full bg-[#202327] text-white placeholder-gray-500 rounded-full pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-[#1d9bf0] focus:ring-1 focus:ring-[#1d9bf0] border border-transparent transition-all"
        />
      </div>

      {/* Subscribe to Premium Banner */}
      <div className="bg-[#16181c] border border-[#2f3336] rounded-2xl p-4 flex flex-col gap-2">
        <h3 className="font-bold text-lg text-white">Subscribe to Premium</h3>
        <p className="text-xs text-gray-400 leading-relaxed">
          Subscribe to unlock new features and if eligible, receive a share of ads revenue.
        </p>
        <button className="w-fit bg-[#1d9bf0] hover:bg-[#1a8cd8] text-white font-bold px-4 py-2 rounded-full text-sm transition-all cursor-pointer mt-1">
          Subscribe
        </button>
      </div>

      {/* Trending Topics */}
      <TrendingWidget trends={trends} />

      {/* Who to Follow */}
      <WhoToFollowWidget accounts={whoToFollow} onToggleFollow={onToggleFollow} />

      {/* Footer Terms */}
      <footer className="px-2 text-xs text-gray-500 flex flex-wrap gap-x-3 gap-y-1">
        <a href="#" className="hover:underline">Terms of Service</a>
        <a href="#" className="hover:underline">Privacy Policy</a>
        <a href="#" className="hover:underline">Cookie Policy</a>
        <span>© 2026 Cwitter, Inc.</span>
      </footer>

    </aside>
  );
};

export default RightSidebar;
