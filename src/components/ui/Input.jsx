'use client';

import React, { forwardRef } from 'react';

export const Input = forwardRef(function Input(
  {
    label,
    error,
    hint,
    leftIcon,
    rightIcon,
    required = false,
    className = '',
    containerClassName = '',
    id,
    type = 'text',
    ...props
  },
  ref
) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`w-full flex flex-col gap-1.5 ${containerClassName}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs uppercase tracking-[0.12em] font-medium text-[#44403C] flex items-center justify-between"
        >
          <span>
            {label}
            {required && <span className="text-[#8E2824] ml-1">*</span>}
          </span>
        </label>
      )}

      <div className="relative flex items-center">
        {leftIcon && (
          <span className="absolute left-3 text-[#78716C] pointer-events-none flex items-center">
            {leftIcon}
          </span>
        )}

        <input
          ref={ref}
          id={inputId}
          type={type}
          required={required}
          className={`w-full px-3.5 py-2.5 text-sm bg-white text-[#1C1917] placeholder-[#A8A29E] border border-[#E7E3D9] rounded-md transition-all duration-200 outline-none focus:border-[#B08D57] focus:ring-1 focus:ring-[#B08D57]/30 disabled:bg-[#F4F1EA] disabled:cursor-not-allowed ${
            leftIcon ? 'pl-9' : ''
          } ${rightIcon ? 'pr-9' : ''} ${
            error ? 'border-[#8E2824] focus:border-[#8E2824] focus:ring-[#8E2824]/20' : ''
          } ${className}`}
          {...props}
        />

        {rightIcon && (
          <span className="absolute right-3 text-[#78716C] flex items-center">
            {rightIcon}
          </span>
        )}
      </div>

      {error ? (
        <p className="text-xs text-[#8E2824] flex items-center gap-1 mt-0.5">
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </p>
      ) : hint ? (
        <p className="text-[11px] text-[#78716C] mt-0.5">{hint}</p>
      ) : null}
    </div>
  );
});

export default Input;
