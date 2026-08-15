import React from 'react';
import { getAvatarUrl } from '../../utils/constants';
import {
  Heart,
  Repeat2,
  MessageCircle,
  Share,
  Bookmark,
  BarChart2,
  CheckCircle2,
  MoreHorizontal
} from 'lucide-react';

const PostItem = ({ post, onLike, onRetweet, onBookmark, onShare }) => {
  return (
    <article className="p-4 hover:bg-[#080808] transition-colors flex gap-3.5 cursor-pointer">
      {/* Author Avatar */}
      <img
        src={getAvatarUrl(post.author?.avatar)}
        alt={post.author.fullName}
        className="w-11 h-11 rounded-full object-cover shrink-0 bg-[#16181c]"
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col gap-2">
        
        {/* Author Meta Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5 text-sm">
            <span className="font-bold text-white hover:underline">{post.author.fullName}</span>
            {post.author.verified && <CheckCircle2 className="w-4 h-4 text-[#1d9bf0]" />}
            <span className="text-gray-500">@{post.author.username}</span>
            <span className="text-gray-500">·</span>
            <span className="text-gray-500">{post.createdAt}</span>
          </div>
          <MoreHorizontal className="w-4 h-4 text-gray-500 hover:text-white" />
        </div>

        {/* Post Text */}
        <p className="text-[#e7e9ea] text-[15px] leading-normal whitespace-pre-line">{post.content}</p>

        {/* Post Image Attachment */}
        {post.image && (
          <div className="mt-2 rounded-2xl overflow-hidden border border-[#2f3336] max-h-96">
            <img src={post.image} alt="post media" className="w-full h-full object-cover" />
          </div>
        )}

        {/* Action Buttons Row */}
        <div className="flex items-center justify-between text-gray-500 max-w-md pt-2 text-xs">
          
          {/* Reply */}
          <button className="flex items-center space-x-2 hover:text-[#1d9bf0] group transition-colors cursor-pointer">
            <div className="p-2 rounded-full group-hover:bg-[#1d9bf0]/10">
              <MessageCircle className="w-4 h-4" />
            </div>
            <span>{post.replies}</span>
          </button>

          {/* Retweet */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRetweet(post.id);
            }}
            className={`flex items-center space-x-2 group transition-colors cursor-pointer ${
              post.isRetweeted ? 'text-emerald-500 font-semibold' : 'hover:text-emerald-500'
            }`}
          >
            <div className="p-2 rounded-full group-hover:bg-emerald-500/10">
              <Repeat2 className="w-4 h-4" />
            </div>
            <span>{post.retweets}</span>
          </button>

          {/* Like */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onLike(post.id);
            }}
            className={`flex items-center space-x-2 group transition-colors cursor-pointer ${
              post.isLiked ? 'text-rose-500 font-semibold' : 'hover:text-rose-500'
            }`}
          >
            <div className="p-2 rounded-full group-hover:bg-rose-500/10">
              <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-current' : ''}`} />
            </div>
            <span>{post.likes}</span>
          </button>

          {/* Views */}
          <div className="flex items-center space-x-2">
            <div className="p-2">
              <BarChart2 className="w-4 h-4" />
            </div>
            <span>{post.views}</span>
          </div>

          {/* Bookmark & Share */}
          <div className="flex items-center space-x-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onBookmark(post.id);
              }}
              className={`p-2 rounded-full hover:bg-[#1d9bf0]/10 cursor-pointer ${
                post.isBookmarked ? 'text-[#1d9bf0]' : 'hover:text-[#1d9bf0]'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${post.isBookmarked ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onShare(post.id);
              }}
              className="p-2 rounded-full hover:bg-[#1d9bf0]/10 hover:text-[#1d9bf0] cursor-pointer"
            >
              <Share className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>
    </article>
  );
};

export default PostItem;
