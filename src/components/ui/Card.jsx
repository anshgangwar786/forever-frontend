'use client';

import React from 'react';

export const Card = ({
  children,
  variant = 'default', // 'default' (white) | 'canvas' (#FAF8F5) | 'muted' (#F4F1EA) | 'dark' (#1C1917)
  hoverLift = false,
  className = '',
  ...props
}) => {
  const variantStyles = {
    default: 'bg-white border-[#E7E3D9] text-[#1C1917]',
    canvas: 'bg-[#FAF8F5] border-[#E7E3D9] text-[#1C1917]',
    muted: 'bg-[#F4F1EA] border-[#E7E3D9] text-[#1C1917]',
    dark: 'bg-[#1C1917] border-[#292524] text-[#FAF8F5]',
  };

  const liftStyles = hoverLift
    ? 'transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:shadow-[0_12px_32px_-4px_rgba(28,25,23,0.08)]'
    : '';

  return (
    <div
      className={`border rounded-xl shadow-[0_1px_3px_rgba(28,25,23,0.04)] ${
        variantStyles[variant] || variantStyles.default
      } ${liftStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '', ...props }) => (
  <div
    className={`px-5 py-4 border-b border-[#E7E3D9] flex items-center justify-between ${className}`}
    {...props}
  >
    {children}
  </div>
);

export const CardBody = ({ children, className = '', ...props }) => (
  <div className={`p-5 ${className}`} {...props}>
    {children}
  </div>
);

export const CardFooter = ({ children, className = '', ...props }) => (
  <div
    className={`px-5 py-3.5 border-t border-[#E7E3D9] bg-[#FAF8F5]/60 flex items-center justify-between ${className}`}
    {...props}
  >
    {children}
  </div>
);

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

export default Card;
