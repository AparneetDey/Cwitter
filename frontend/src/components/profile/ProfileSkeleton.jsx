import React from 'react';
import Skeleton from '../common/Skeleton';

const ProfileSkeleton = () => {
  return (
    <div className="w-full max-w-[600px] border-r border-[#2f3336] bg-black min-h-screen pb-16 select-none">
      
      {/* Sticky Header Skeleton */}
      <div className="sticky top-0 bg-black/80 backdrop-blur-md z-30 border-b border-[#2f3336] flex items-center space-x-6 px-4 py-3">
        <Skeleton variant="circular" className="w-8 h-8" />
        <div className="space-y-1.5">
          <Skeleton variant="text" className="w-32 h-4" />
          <Skeleton variant="text" className="w-16 h-3" />
        </div>
      </div>

      {/* Cover Image Banner Skeleton */}
      <Skeleton variant="rectangular" className="h-48 sm:h-56 w-full" />

      {/* Avatar & Action Button Row Skeleton */}
      <div className="px-4 pb-4 flex justify-between items-end relative">
        <div className="-mt-16 sm:-mt-20 relative">
          <Skeleton variant="circular" className="w-28 h-28 sm:w-36 sm:h-36 border-4 border-black" />
        </div>
        <Skeleton variant="rounded" className="w-28 h-9" />
      </div>

      {/* Profile Details Metadata Skeleton */}
      <div className="px-4 space-y-4 border-b border-[#2f3336] pb-4">
        {/* Name & Handle */}
        <div className="space-y-1.5">
          <Skeleton variant="text" className="w-40 h-5" />
          <Skeleton variant="text" className="w-24 h-3.5" />
        </div>

        {/* Bio */}
        <div className="space-y-2 pt-1">
          <Skeleton variant="text" className="w-full h-4" />
          <Skeleton variant="text" className="w-3/4 h-4" />
        </div>

        {/* Joined / Location Info */}
        <div className="flex items-center space-x-4 pt-1">
          <Skeleton variant="text" className="w-28 h-3.5" />
          <Skeleton variant="text" className="w-36 h-3.5" />
        </div>

        {/* Following / Followers Stats */}
        <div className="flex items-center space-x-6 pt-1">
          <Skeleton variant="text" className="w-20 h-4" />
          <Skeleton variant="text" className="w-20 h-4" />
        </div>
      </div>

      {/* Tab Navigation Skeleton */}
      <div className="flex border-b border-[#2f3336] py-3.5 px-4 justify-around">
        <Skeleton variant="text" className="w-16 h-4" />
        <Skeleton variant="text" className="w-16 h-4" />
        <Skeleton variant="text" className="w-16 h-4" />
      </div>

    </div>
  );
};

export default ProfileSkeleton;
