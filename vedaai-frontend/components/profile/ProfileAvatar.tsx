'use client';

import Image from 'next/image';
import { useProfileStore } from '@/lib/profileStore';

const sizeMap = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-9 h-9 text-sm',
  xl: 'w-10 h-10 text-base',
  lg: 'w-20 h-20 text-2xl',
};

export default function ProfileAvatar({ size = 'md' }: { size?: 'sm' | 'md' | 'xl' | 'lg' }) {
  const hasHydrated = useProfileStore((s) => s.hasHydrated);
  const profile = useProfileStore((s) => s.profile);
  const getInitials = useProfileStore((s) => s.getInitials);

  if (!hasHydrated) return <div className={`${sizeMap[size]} rounded-full bg-[#E5E7EB] flex-shrink-0 animate-pulse`} />;

  if (profile.avatar) {
    return (
      <div
        className={`${sizeMap[size]} rounded-full overflow-hidden shadow-sm border border-black/10 flex-shrink-0 relative bg-[#F5F5F5]`}
        suppressHydrationWarning
      >
        <img 
          src={profile.avatar} 
          alt="Teacher Profile"
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={`${sizeMap[size]} rounded-full shadow-sm flex items-center justify-center font-bold text-white bg-[#1F2937] flex-shrink-0`}
      suppressHydrationWarning
    >
      {getInitials()}
    </div>
  );
}
