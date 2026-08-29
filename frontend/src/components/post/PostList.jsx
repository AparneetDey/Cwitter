import React, { useEffect, useRef } from 'react';
import PostItem from './PostItem';
import PostSkeleton from './PostSkeleton';

const PostList = ({
  posts,
  setPosts,
  loading = false,
  loadingMore = false,
  hasNextPage = false,
  onLoadMore,
  onBookmarkToggle,
  emptyMessage = 'No posts to display yet.'
}) => {
  const sentinelRef = useRef(null);

  // Auto infinite scroll when bottom sentinel scrolls into view
  useEffect(() => {
    if (!hasNextPage || loadingMore || !onLoadMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMore();
        }
      },
      { threshold: 0.1, rootMargin: '200px' }
    );

    const currentSentinel = sentinelRef.current;
    if (currentSentinel) {
      observer.observe(currentSentinel);
    }

    return () => {
      if (currentSentinel) {
        observer.unobserve(currentSentinel);
      }
    };
  }, [hasNextPage, loadingMore, onLoadMore]);

  if (loading) {
    return <PostSkeleton count={3} />;
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="p-12 text-center text-gray-500 text-sm">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="divide-y divide-[#2f3336]">
      {posts.map((post) => (
        <PostItem
          key={post._id || post.id}
          post={post}
          setPosts={setPosts}
          onBookmarkToggle={onBookmarkToggle}
        />
      ))}

      {/* Skeleton Loading Placeholder for Next Page */}
      {loadingMore && <PostSkeleton count={2} />}

      {/* Invisible IntersectionObserver Sentinel for Infinite Scroll */}
      {hasNextPage && !loadingMore && (
        <div ref={sentinelRef} className="h-10 w-full bg-transparent" />
      )}
    </div>
  );
};

export default PostList;
