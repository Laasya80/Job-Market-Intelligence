import React from 'react';

export const BrandMark: React.FC<{ size?: 'sm' | 'md' }> = ({ size = 'md' }) => (
  <div className={`${size === 'sm' ? 'h-9 w-9 rounded-xl' : 'h-11 w-11 rounded-2xl'} flex items-center justify-center bg-teal-700 text-white shadow-sm`} aria-label="JMI logo">
    <svg viewBox="0 0 40 40" className={size === 'sm' ? 'h-5 w-5' : 'h-6 w-6'} fill="none" aria-hidden="true">
      <path d="M20 13c-4.2-3.4-9-4.2-14-2.8v18.2c5-1.4 9.8-.6 14 2.8 4.2-3.4 9-4.2 14-2.8V10.2c-5-1.4-9.8-.6-14 2.8Z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M20 13v18.2" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="m24 23 3.2-3.2 3 1.6 3-4.4" stroke="#A7F3D0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M33.2 17v4.2H29" stroke="#A7F3D0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </div>
);
