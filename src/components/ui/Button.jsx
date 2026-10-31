'use client';

import React, { useRef, useState } from 'react';

export const Button = ({
  children,
  variant = 'primary', // 'primary' | 'accent' | 'secondary' | 'ghost' | 'danger'
  size = 'md', // 'sm' | 'md' | 'lg' | 'icon'
  magnetic = false,
  loading = false,
  disabled = false,
  className = '',
  icon,
  iconRight,
  onClick,
  type = 'button',
  ...props
}) => {
  const btnRef = useRef(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    if (!magnetic || disabled || loading) return;
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    const rect = btnRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    // max 4px pull
    const deltaX = (e.clientX - centerX) * 0.12;
    const deltaY = (e.clientY - centerY) * 0.12;
    const clampedX = Math.max(-4, Math.min(4, deltaX));
    const clampedY = Math.max(-4, Math.min(4, deltaY));
    setOffset({ x: clampedX, y: clampedY });
  };

  const handleMouseLeave = () => {
    if (!magnetic) return;
    setOffset({ x: 0, y: 0 });
  };

  const baseStyles =
    'relative inline-flex items-center justify-center font-medium transition-all select-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50';

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs gap-1.5 rounded-sm tracking-wider uppercase',
    md: 'px-5 py-2.5 text-xs gap-2 rounded-sm tracking-[0.15em] uppercase font-medium',
    lg: 'px-7 py-3.5 text-sm gap-2.5 rounded-sm tracking-[0.18em] uppercase font-medium',
    icon: 'p-2.5 rounded-full aspect-square',
  };

  const variantStyles = {
    primary:
      'bg-[#1C1917] text-[#FAF8F5] border border-[#1C1917] hover:bg-[#292524] hover:shadow-[0_4px_16px_rgba(28,25,23,0.14)] active:translate-y-0',
    accent:
      'bg-[#B08D57] text-[#FAF8F5] border border-[#B08D57] hover:bg-[#967543] hover:shadow-[0_4px_16px_rgba(176,141,87,0.25)] active:translate-y-0',
    secondary:
      'bg-transparent text-[#1C1917] border border-[#1C1917] hover:bg-[#1C1917] hover:text-[#FAF8F5] active:translate-y-0',
    outline:
      'bg-transparent text-[#1C1917] border border-[#E7E3D9] hover:border-[#1C1917] hover:bg-[#F4F1EA] active:translate-y-0',
    ghost:
      'bg-transparent text-[#1C1917] hover:bg-[#1C1917]/5 active:bg-[#1C1917]/10',
    danger:
      'bg-[#FAECEB] text-[#8E2824] border border-[#E8C4C2] hover:bg-[#8E2824] hover:text-white',
  };

  const transformStyle = magnetic
    ? {
        transform: `translate3d(${offset.x}px, ${offset.y}px, 0)`,
        transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
      }
    : undefined;

  return (
    <button
      ref={btnRef}
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={transformStyle}
      className={`${baseStyles} ${sizeStyles[size] || sizeStyles.md} ${
        variantStyles[variant] || variantStyles.primary
      } ${className}`}
      {...props}
    >
      {loading ? (
        <span className="inline-flex items-center gap-2">
          <svg
            className="w-3.5 h-3.5 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            />
          </svg>
          <span>Processing...</span>
        </span>
      ) : (
        <>
          {icon && <span className="shrink-0">{icon}</span>}
          {children}
          {iconRight && <span className="shrink-0">{iconRight}</span>}
        </>
      )}
    </button>
  );
};

export default Button;
