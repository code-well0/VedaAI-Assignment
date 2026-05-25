import React from 'react';

export function IconMobileHome({ className }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <rect x="4" y="4" width="6.5" height="6.5" rx="2.5" />
      <rect x="13.5" y="4" width="6.5" height="6.5" rx="2.5" />
      <rect x="4" y="13.5" width="6.5" height="6.5" rx="2.5" />
      <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="2.5" />
    </svg>
  );
}

export function IconMobileAssignments({ className }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none">
      <mask id="assignments-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
        <path d="M7 4V3C7 2.44772 7.44772 2 8 2H9C9.55228 2 10 2.44772 10 3V4H14V3C14 2.44772 14.4477 2 15 2H16C16.5523 2 17 2.44772 17 3V4H18.5C20.433 4 22 5.567 22 7.5V18.5C22 20.433 20.433 22 18.5 22H5.5C3.567 22 2 20.433 2 18.5V7.5C2 5.567 3.567 4 5.5 4H7Z" fill="white" />
        <rect x="6.5" y="10" width="11" height="3" rx="1.5" fill="black" />
        <rect x="15" y="16" width="3" height="3" rx="1" fill="black" />
      </mask>
      <rect width="24" height="24" fill="currentColor" mask="url(#assignments-mask)" />
    </svg>
  );
}

export function IconMobileLibrary({ className }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none">
      <mask id="library-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
        <path d="M13 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V9L13 2Z" fill="white" />
        <rect x="8.5" y="14.5" width="7" height="2" rx="0.5" fill="black" />
        <rect x="11" y="12" width="2" height="7" rx="0.5" fill="black" />
      </mask>
      <rect width="24" height="24" fill="currentColor" mask="url(#library-mask)" />
      <path d="M14 2V5.5C14 6.88071 15.1193 8 16.5 8H20L14 2Z" fill="currentColor" />
    </svg>
  );
}

export function IconMobileToolkit({ className }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M9.5 3C9.5 8.5 8.5 9.5 4 11C8.5 12.5 9.5 13.5 9.5 19C9.5 13.5 10.5 12.5 15 11C10.5 9.5 9.5 8.5 9.5 3Z" />
      <path d="M18 3C18 5 17.5 5.5 15.5 6C17.5 6.5 18 7 18 9C18 7 18.5 6.5 20.5 6C18.5 5.5 18 5 18 3Z" />
      <path d="M21.5 10C21.5 11 21 11.5 19.5 12C21 12.5 21.5 13 21.5 14C21.5 13 22 12.5 23.5 12C22 11.5 21.5 11 21.5 10Z" />
    </svg>
  );
}
