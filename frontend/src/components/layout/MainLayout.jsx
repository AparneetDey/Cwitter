import React, { useState } from 'react';
import { Outlet } from 'react-router';
import Sidebar from './Sidebar';
import RightSidebar from './RightSidebar';
import Toast from '../common/Toast';

const INITIAL_TRENDS = [
  { category: 'Technology · Trending', topic: '#ReactJS', posts: '45.2K posts' },
  { category: 'Web Development · Trending', topic: '#ExpressJS', posts: '28.4K posts' },
  { category: 'Trending in India', topic: '#CwitterLaunch', posts: '98.1K posts' },
  { category: 'Design · Trending', topic: '#TailwindCSS', posts: '14.9K posts' },
];

const INITIAL_WHO_TO_FOLLOW = [
  { id: 1, fullName: 'Alex Rivera', username: 'alexrivera', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', verified: true, isFollowing: false },
  { id: 2, fullName: 'Elena Rostova', username: 'elena_tech', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80', verified: true, isFollowing: false },
  { id: 3, fullName: 'DevPulse Community', username: 'devpulse', avatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150&auto=format&fit=crop&q=80', verified: false, isFollowing: false },
];

const MainLayout = () => {
  const [trends] = useState(INITIAL_TRENDS);
  const [whoToFollow, setWhoToFollow] = useState(INITIAL_WHO_TO_FOLLOW);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleToggleFollow = (id) => {
    setWhoToFollow((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isFollowing: !item.isFollowing } : item
      )
    );
  };

  return (
    <div className="min-h-screen bg-black text-[#e7e9ea] font-sans flex justify-center selection:bg-[#1d9bf0] selection:text-white">
      {/* Persistent Toast Notification */}
      <Toast message={toastMessage} />

      <div className="w-full max-w-7xl flex">
        {/* Left Sidebar - Persistent across route changes */}
        <Sidebar />

        {/* Center Main Content Outlet */}
        <div className="flex-1 flex justify-center min-w-0">
          <Outlet context={{ showToast }} />
        </div>

        {/* Right Sidebar - Persistent across route changes */}
        <RightSidebar
          trends={trends}
          whoToFollow={whoToFollow}
          onToggleFollow={handleToggleFollow}
        />
      </div>
    </div>
  );
};

export default MainLayout;
