import React from 'react';
import { TrendingUp, MoreHorizontal } from 'lucide-react';
import { TrendingWidgetSkeleton } from './WidgetSkeleton';

const DEFAULT_TRENDS = [
  { category: 'Technology · Trending', topic: '#JavaScript', posts: '124.5K posts' },
  { category: 'Web Development · Trending', topic: 'React 19', posts: '85.2K posts' },
  { category: 'AI & Data · Trending', topic: 'Antigravity AI', posts: '42.1K posts' },
  { category: 'Design · Trending', topic: '#TailwindCSS', posts: '28.9K posts' },
];

const TrendingWidget = ({ trends = DEFAULT_TRENDS, loading = false }) => {
  if (loading || !trends) {
    return <TrendingWidgetSkeleton count={4} />;
  }

  return (
    <div className="cwitter-widget-card">
      <h3 className="font-bold text-lg text-white flex items-center space-x-2">
        <TrendingUp className="w-5 h-5 text-[#1d9bf0]" />
        <span>What’s happening</span>
      </h3>

      <div className="flex flex-col gap-3 pt-1">
        {trends.map((trend, idx) => (
          <div key={idx} className="flex justify-between items-start hover:bg-[#1f2226] p-2 rounded-xl transition-colors cursor-pointer">
            <div>
              <span className="text-xs text-gray-500 block">{trend.category}</span>
              <span className="font-bold text-sm text-white block">{trend.topic}</span>
              <span className="text-xs text-gray-500 block pt-0.5">{trend.posts}</span>
            </div>
            <MoreHorizontal className="w-4 h-4 text-gray-500 hover:text-white" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrendingWidget;
