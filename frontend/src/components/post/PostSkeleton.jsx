import React from 'react';
import Skeleton from '../common/Skeleton';

const PostSkeletonItem = () => {
  return (
    <div className="p-4 border-b border-[#2f3336] bg-black flex gap-3.5 select-none">
      {/* Avatar Skeleton */}
      <Skeleton variant="circular" className="w-11 h-11" />

      {/* Post Body Content Skeleton */}
      <div className="flex-1 flex flex-col gap-3">
        
        {/* Header Line (Author Name, Username, Time) */}
        <div className="flex items-center space-x-2">
          <Skeleton variant="text" className="w-28 h-4" />
          <Skeleton variant="text" className="w-20 h-3" />
          <Skeleton variant="text" className="w-8 h-3" />
        </div>

        {/* Post Text Lines */}
        <div className="space-y-2 pt-1">
          <Skeleton variant="text" className="w-11/12 h-4" />
          <Skeleton variant="text" className="w-4/5 h-4" />
          <Skeleton variant="text" className="w-3/5 h-4" />
        </div>

        {/* Optional Media Skeleton Box */}
        <Skeleton variant="rounded" className="w-full h-48 mt-1" />

        {/* Bottom Action Icon Row Skeletons */}
        <div className="flex items-center justify-between max-w-md pt-2">
          <Skeleton variant="circular" className="w-5 h-5" />
          <Skeleton variant="circular" className="w-5 h-5" />
          <Skeleton variant="circular" className="w-5 h-5" />
          <Skeleton variant="circular" className="w-5 h-5" />
          <Skeleton variant="circular" className="w-5 h-5" />
        </div>

      </div>
    </div>
  );
};

const PostSkeleton = ({ count = 3 }) => {
  return (
    <div className="divide-y divide-[#2f3336]">
      {Array.from({ length: count }).map((_, index) => (
        <PostSkeletonItem key={index} />
      ))}
    </div>
  );
};

export default PostSkeleton;
