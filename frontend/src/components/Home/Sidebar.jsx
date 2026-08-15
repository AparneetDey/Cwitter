import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import CwitterLogo from '../../elements/CwitterLogo';
import {
  Home as HomeIcon,
  Compass,
  Bell,
  Mail,
  Bookmark,
  User as UserIcon,
  MoreHorizontal,
  Feather,
  LogOut
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const displayUser = user || {
    fullName: 'Guest User',
    username: 'guest',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside className="w-20 xl:w-64 h-screen sticky top-0 flex flex-col justify-between p-3 xl:p-4 border-r border-[#2f3336] select-none shrink-0">
      <div className="flex flex-col gap-4">
        
        {/* Logo */}
        <Link to="/" className="p-3 w-fit rounded-full hover:bg-[#181818] transition-colors flex items-center justify-center">
          <div className="w-10 h-10 text-[#1d9bf0]">
            <CwitterLogo />
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="flex flex-col gap-1">
          <Link to="/" className="flex items-center gap-4 p-3 rounded-full hover:bg-[#181818] transition-colors text-white font-bold">
            <HomeIcon className="w-7 h-7" />
            <span className="hidden xl:inline text-xl">Home</span>
          </Link>
          
          <a href="#" className="flex items-center gap-4 p-3 rounded-full hover:bg-[#181818] transition-colors text-gray-300 hover:text-white">
            <Compass className="w-7 h-7" />
            <span className="hidden xl:inline text-xl font-medium">Explore</span>
          </a>

          <a href="#" className="flex items-center gap-4 p-3 rounded-full hover:bg-[#181818] transition-colors text-gray-300 hover:text-white relative">
            <div className="relative">
              <Bell className="w-7 h-7" />
              <span className="absolute -top-1 -right-1 bg-[#1d9bf0] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">4</span>
            </div>
            <span className="hidden xl:inline text-xl font-medium">Notifications</span>
          </a>

          <a href="#" className="flex items-center gap-4 p-3 rounded-full hover:bg-[#181818] transition-colors text-gray-300 hover:text-white">
            <Mail className="w-7 h-7" />
            <span className="hidden xl:inline text-xl font-medium">Messages</span>
          </a>

          <a href="#" className="flex items-center gap-4 p-3 rounded-full hover:bg-[#181818] transition-colors text-gray-300 hover:text-white">
            <Bookmark className="w-7 h-7" />
            <span className="hidden xl:inline text-xl font-medium">Bookmarks</span>
          </a>

          <a href="#" className="flex items-center gap-4 p-3 rounded-full hover:bg-[#181818] transition-colors text-gray-300 hover:text-white">
            <UserIcon className="w-7 h-7" />
            <span className="hidden xl:inline text-xl font-medium">Profile</span>
          </a>

          <a href="#" className="flex items-center gap-4 p-3 rounded-full hover:bg-[#181818] transition-colors text-gray-300 hover:text-white">
            <MoreHorizontal className="w-7 h-7" />
            <span className="hidden xl:inline text-xl font-medium">More</span>
          </a>
        </nav>

        {/* Post Button */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="mt-2 w-full bg-[#1d9bf0] hover:bg-[#1a8cd8] text-white font-bold py-3.5 px-4 rounded-full transition-all flex items-center justify-center shadow-lg shadow-[#1d9bf0]/20 cursor-pointer"
        >
          <Feather className="w-6 h-6 xl:hidden" />
          <span className="hidden xl:inline text-base">Post</span>
        </button>
      </div>

      {/* User Profile Pill at Bottom */}
      <div className="relative">
        {showUserMenu && (
          <div className="absolute bottom-16 left-0 w-60 bg-[#16181c] border border-[#2f3336] rounded-2xl shadow-2xl p-2 z-50 flex flex-col gap-1 animate-fade-in">
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 p-3 text-red-400 hover:bg-red-950/40 rounded-xl transition-colors text-sm font-semibold cursor-pointer"
            >
              <LogOut className="w-5 h-5" />
              <span>Log out @{displayUser.username}</span>
            </button>
          </div>
        )}

        <button
          onClick={() => setShowUserMenu(!showUserMenu)}
          className="w-full flex items-center justify-between p-2.5 rounded-full hover:bg-[#181818] transition-colors cursor-pointer"
        >
          <div className="flex items-center space-x-3">
            <img
              src={displayUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
              alt="avatar"
              className="w-10 h-10 rounded-full object-cover border border-[#2f3336]"
            />
            <div className="hidden xl:flex flex-col text-left">
              <span className="font-bold text-sm text-white truncate max-w-[120px]">{displayUser.fullName}</span>
              <span className="text-gray-500 text-xs truncate max-w-[120px]">@{displayUser.username}</span>
            </div>
          </div>
          <MoreHorizontal className="hidden xl:block w-5 h-5 text-gray-400" />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
