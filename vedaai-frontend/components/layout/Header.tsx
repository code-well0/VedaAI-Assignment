'use client';

import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Bell, ChevronDown, Menu } from 'lucide-react';
import { useProfileStore } from '@/lib/profileStore';
import { useUIStore } from '@/lib/uiStore';
import ProfileAvatar from '@/components/profile/ProfileAvatar';
import VedaAIWordmark from '@/components/brand/VedaAIWordmark';

const pageTitles: Record<string, string> = {
  '/': 'Home',
  '/assignments': 'Assignments',
  '/assignments/create': 'Create Assignment',
  '/profile': 'Teacher Profile',
  '/library': 'My Library',
  '/groups': 'My Groups',
  '/ai-toolkit': "AI Teacher's Toolkit",
};

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { profile, isComplete } = useProfileStore();
  const { toggleMobileSidebar } = useUIStore();

  const pageTitle =
    pageTitles[pathname] ||
    (pathname.startsWith('/assignments/') ? 'Assignment Output' : 'Assignment');

  const isMainPage = pathname === '/' || pathname === '/assignments' || pathname === '/library' || pathname === '/groups' || pathname === '/ai-toolkit';

  return (
    <header className="w-full relative z-20">
      {/* Mobile Header (Main Pages) */}
      <div className={`md:hidden w-full px-4 pt-3 pb-2 ${!isMainPage ? 'hidden' : ''}`}>
        <div className="bg-white rounded-2xl h-[60px] px-4 flex items-center justify-between shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <VedaAIWordmark />
          <div className="flex items-center gap-4">
            <button className="relative" type="button">
              <Bell size={22} className="text-[#1A1A1A]" strokeWidth={2} />
              <span className="absolute top-0 right-0 w-[10px] h-[10px] bg-[#E8762A] rounded-full border-[2px] border-white" />
            </button>
            <Link href="/profile" className="shrink-0">
              <ProfileAvatar size="sm" />
            </Link>
            <button className="text-[#1A1A1A]" onClick={toggleMobileSidebar}>
              <Menu size={24} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Header (Inner Pages) */}
      <div className={`md:hidden w-full h-[72px] px-4 pt-3 ${isMainPage ? 'hidden' : ''}`}>
        <div className="w-full h-full bg-[#F7F7F7] rounded-[20px] px-6 flex items-center gap-3 shadow-sm">
          <button onClick={() => router.back()} className="text-[#707070] hover:text-black">
            <ArrowLeft size={20} strokeWidth={2.2} />
          </button>
          <span className="veda-body text-[#1A1A1A] font-medium">{pageTitle}</span>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:block w-full h-[72px] px-5 pt-3">
        <div className="w-full h-full bg-[#F7F7F7] rounded-[20px] px-6 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="text-[#707070] hover:text-black transition-all"
            type="button"
          >
            <ArrowLeft size={20} strokeWidth={2.2} />
          </button>

          <span className="veda-body text-[#5E5E5E]/80">{pageTitle}</span>
        </div>

        <div className="flex items-center gap-5">
          <button className="relative" type="button">
            <Bell size={18} className="text-[#2B2B2B]" strokeWidth={2} />
            <span className="absolute -top-1 -right-1 w-[7px] h-[7px] bg-[#FF6B35] rounded-full" />
          </button>

          <Link
            href="/profile"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <ProfileAvatar size="sm" />
            <span className="veda-body text-[#1A1A1A] font-medium hidden sm:inline">
              {isComplete ? profile.name : 'Your Profile'}
            </span>
            <ChevronDown size={16} className="text-[#707070] hidden sm:block" />
          </Link>
        </div>
      </div>
      </div>
    </header>
  );
}
