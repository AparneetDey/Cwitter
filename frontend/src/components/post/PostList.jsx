import React from 'react';
import PostItem from './PostItem';
import PostSkeleton from './PostSkeleton';

const PostList = ({ posts, loading = false, onLike, onRetweet, onBookmark, onShare }) => {
  if (loading) {
    return <PostSkeleton count={3} />;
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="p-12 text-center text-gray-500 text-sm">
        No posts to display yet.
      </div>
    );
  }

  return (
    <div className="divide-y divide-[#2f3336]">
      {posts.map((post) => (
        <PostItem
          key={post.id}
          post={post}
          onLike={onLike}
          onRetweet={onRetweet}
          onBookmark={onBookmark}
          onShare={onShare}
        />
      ))}
    </div>
  );
};

export default PostList;
