import React from 'react';
import Skeleton from '../common/Skeleton';

const UserListSkeletonItem = () => {
  return (
    <div className="p-4 border-b border-[#2f3336] bg-black flex items-start justify-between gap-3 select-none">
      <div className="flex items-start space-x-3 flex-1">
        {/* Avatar Skeleton */}
        <Skeleton variant="circular" className="w-11 h-11" />

        {/* User Details Skeleton */}
        <div className="flex-1 space-y-2 pt-0.5">
          {/* Name & Handle Line */}
          <div className="space-y-1">
            <Skeleton variant="text" className="w-32 h-4" />
            <Skeleton variant="text" className="w-20 h-3" />
          </div>

          {/* Bio Lines */}
          <div className="space-y-1.5 pt-1">
            <Skeleton variant="text" className="w-11/12 h-3.5" />
            <Skeleton variant="text" className="w-3/4 h-3.5" />
          </div>
        </div>
      </div>

      {/* Button Skeleton */}
      <Skeleton variant="rounded" className="w-20 h-8 mt-1" />
    </div>
  );
};

const UserListSkeleton = ({ count = 4 }) => {
  return (
    <div className="divide-y divide-[#2f3336]">
      {Array.from({ length: count }).map((_, index) => (
        <UserListSkeletonItem key={index} />
      ))}
    </div>
  );
};

export default UserListSkeleton;
