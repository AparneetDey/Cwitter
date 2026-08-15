import React from 'react';
import { Sparkles } from 'lucide-react';

const Toast = ({ message }) => {
  if (!message) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#1d9bf0] text-white px-5 py-3 rounded-full font-semibold shadow-2xl flex items-center space-x-2 animate-bounce select-none">
      <Sparkles className="w-4 h-4" />
      <span>{message}</span>
    </div>
  );
};

export default Toast;
