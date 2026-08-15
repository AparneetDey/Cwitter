import React from 'react';
import PostItem from './PostItem';

const PostList = ({ posts, onLike, onRetweet, onBookmark, onShare }) => {
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
