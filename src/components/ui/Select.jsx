'use client';

import React, { forwardRef } from 'react';

export const Select = forwardRef(function Select(
  {
    label,
    error,
    hint,
    options = [],
    children,
    required = false,
    className = '',
    containerClassName = '',
    id,
    ...props
  },
  ref
) {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`w-full flex flex-col gap-1.5 ${containerClassName}`}>
      {label && (
        <label
          htmlFor={selectId}
          className="text-xs uppercase tracking-[0.12em] font-medium text-[#44403C] flex items-center justify-between"
        >
          <span>
            {label}
            {required && <span className="text-[#8E2824] ml-1">*</span>}
          </span>
        </label>
      )}

      <div className="relative flex items-center">
        <select
          ref={ref}
          id={selectId}
          required={required}
          className={`w-full px-3.5 py-2.5 text-sm bg-white text-[#1C1917] border border-[#E7E3D9] rounded-md transition-all duration-200 outline-none appearance-none cursor-pointer focus:border-[#B08D57] focus:ring-1 focus:ring-[#B08D57]/30 disabled:bg-[#F4F1EA] disabled:cursor-not-allowed pr-9 ${
            error ? 'border-[#8E2824] focus:border-[#8E2824]' : ''
          } ${className}`}
          {...props}
        >
          {options.length > 0
            ? options.map((opt) =>
                typeof opt === 'string' ? (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ) : (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                )
              )
            : children}
        </select>

        {/* Custom luxury chevron */}
        <span className="absolute right-3 pointer-events-none text-[#78716C]">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </div>

      {error ? (
        <p className="text-xs text-[#8E2824] flex items-center gap-1 mt-0.5">
          {error}
        </p>
      ) : hint ? (
        <p className="text-[11px] text-[#78716C] mt-0.5">{hint}</p>
      ) : null}
    </div>
  );
});

export default Select;
