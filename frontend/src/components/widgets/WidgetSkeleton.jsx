import React from 'react';
import Skeleton from '../common/Skeleton';

export const TrendingWidgetSkeleton = ({ count = 4 }) => {
  return (
    <div className="bg-[#16181c] border border-[#2f3336] rounded-2xl p-4 flex flex-col gap-3 select-none">
      {/* Title */}
      <Skeleton variant="text" className="w-36 h-5 mb-1" />

      {/* List Items */}
      <div className="flex flex-col gap-4">
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className="flex justify-between items-start">
            <div className="space-y-1.5 flex-1 pr-4">
              <Skeleton variant="text" className="w-24 h-3" />
              <Skeleton variant="text" className="w-36 h-4" />
              <Skeleton variant="text" className="w-16 h-3" />
            </div>
            <Skeleton variant="circular" className="w-4 h-4" />
          </div>
        ))}
      </div>
    </div>
  );
};

export const WhoToFollowWidgetSkeleton = ({ count = 3 }) => {
  return (
    <div className="bg-[#16181c] border border-[#2f3336] rounded-2xl p-4 flex flex-col gap-3 select-none">
      {/* Title */}
      <Skeleton variant="text" className="w-28 h-5 mb-1" />

      {/* Accounts List */}
      <div className="flex flex-col gap-3.5">
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1">
              <Skeleton variant="circular" className="w-10 h-10" />
              <div className="space-y-1.5">
                <Skeleton variant="text" className="w-24 h-4" />
                <Skeleton variant="text" className="w-16 h-3" />
              </div>
            </div>
            <Skeleton variant="rounded" className="w-16 h-7" />
          </div>
        ))}
      </div>
    </div>
  );
};
