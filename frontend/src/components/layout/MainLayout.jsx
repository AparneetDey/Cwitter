import React, { useState, useCallback } from 'react';
import { Outlet } from 'react-router';
import Sidebar from './Sidebar';
import RightSidebar from './RightSidebar';
import Toast from '../common/Toast';

const MainLayout = () => {
  const [toastMessage, setToastMessage] = useState('');

  const showToast = useCallback((msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  }, []);

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
        <RightSidebar />
      </div>
    </div>
  );
};

export default MainLayout;
