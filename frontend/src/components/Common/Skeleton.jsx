import React from 'react';

const Skeleton = ({
  variant = 'text', // 'text' | 'circular' | 'rectangular' | 'rounded'
  width,
  height,
  className = '',
  style = {},
  ...props
}) => {
  const baseClasses = 'animate-pulse bg-[#16181c] border border-[#2f3336]/40 select-none';

  const variantClasses = {
    text: 'h-4 w-full rounded-md',
    circular: 'rounded-full shrink-0',
    rectangular: 'rounded-none',
    rounded: 'rounded-2xl',
  };

  const computedStyle = {
    width: width !== undefined ? width : undefined,
    height: height !== undefined ? height : undefined,
    ...style,
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant] || variantClasses.text} ${className}`}
      style={computedStyle}
      {...props}
    />
  );
};

export default Skeleton;
