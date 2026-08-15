import React from 'react';
import { TrendingUp, MoreHorizontal } from 'lucide-react';

const TrendingWidget = ({ trends }) => {
  return (
    <div className="bg-[#16181c] border border-[#2f3336] rounded-2xl p-4 flex flex-col gap-3">
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
