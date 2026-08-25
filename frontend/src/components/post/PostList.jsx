import React from 'react';
import PostItem from './PostItem';
import PostSkeleton from './PostSkeleton';

const PostList = ({ posts, setPosts, loading = false, onBookmarkToggle, emptyMessage = 'No posts to display yet.' }) => {
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
    </div>
  );
};

export default PostList;
