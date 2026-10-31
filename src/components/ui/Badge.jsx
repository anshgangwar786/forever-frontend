'use client';

import React from 'react';

export const Badge = ({
  children,
  variant = 'default', // 'default' | 'accent' | 'success' | 'warning' | 'danger' | 'outline'
  size = 'md', // 'sm' | 'md'
  className = '',
  ...props
}) => {
  const variantStyles = {
    default: 'bg-[#1C1917] text-[#FAF8F5] border border-[#1C1917]',
    accent: 'bg-[#F7F3EB] text-[#B08D57] border border-[#B08D57]/30 font-semibold',
    success: 'bg-[#EBF3EC] text-[#2E5A36] border border-[#C2D9C6]',
    warning: 'bg-[#FAF2E6] text-[#8C581E] border border-[#EAD7BA]',
    danger: 'bg-[#FAECEB] text-[#8E2824] border border-[#E8C4C2]',
    outline: 'bg-transparent text-[#1C1917] border border-[#E7E3D9]',
  };

  const sizeStyles = {
    sm: 'text-[9px] uppercase tracking-[0.14em] px-2 py-0.5 rounded-xs',
    md: 'text-[11px] uppercase tracking-[0.12em] px-2.5 py-1 rounded-xs',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 font-medium transition-transform duration-200 hover:scale-[1.02] ${
        sizeStyles[size] || sizeStyles.md
      } ${variantStyles[variant] || variantStyles.default} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;
