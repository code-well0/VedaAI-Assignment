'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import { useAssignmentStore } from '@/lib/store';
import { useProfileStore } from '@/lib/profileStore';
import { useUIStore } from '@/lib/uiStore';
import ProfileAvatar from '@/components/profile/ProfileAvatar';
import VedaAIWordmark from '@/components/brand/VedaAIWordmark';
import PrimaryButton from '@/components/ui/PrimaryButton';
import { cn } from '@/lib/utils';
import {
  IconHome,
  IconGroups,
  IconAssignments,
  IconToolkit,
  IconLibrary,
  IconSettings,
  IconSparkles,
  FIGMA_ICON_COLOR,
  FIGMA_ICON_COLOR_ACTIVE,
} from '@/components/icons/SidebarIcons';

type NavItem = {
  label: string;
  href: string;
  Icon: ({ className }: { className?: string }) => React.JSX.Element;
  /** Show assignment count (Assignments only) */
  showCount?: boolean;
};

const navItems: NavItem[] = [
  { label: 'Home', href: '/', Icon: IconHome },
  { label: 'My Groups', href: '/groups', Icon: IconGroups },
  { label: 'Assignments', href: '/assignments', Icon: IconAssignments, showCount: true },
  { label: "AI Teacher's Toolkit", href: '/ai-toolkit', Icon: IconToolkit },
  { label: 'My Library', href: '/library', Icon: IconLibrary },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { assignments, fetchAssignments } = useAssignmentStore();
  const { profile, isComplete } = useProfileStore();
  const { isMobileSidebarOpen, setMobileSidebarOpen } = useUIStore();

  const schoolLines = useMemo(
    () =>
      isComplete
        ? { primary: profile.schoolName, secondary: profile.schoolAddress }
        : { primary: 'Set up profile', secondary: '' },
    [isComplete, profile.schoolName, profile.schoolAddress]
  );

  useEffect(() => {
    if (assignments.length === 0) {
      fetchAssignments();
    }
  }, [assignments.length, fetchAssignments]);

  const navLinkClass = (active: boolean) =>
    `veda-body flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
      active
        ? 'text-[#1A1A1A] bg-[#F3F4F6] font-normal'
        : 'text-[#5E5E5E]/80 hover:text-[#1A1A1A] hover:bg-[#FAFAFA] font-normal'
    }`;

  const iconClass = (active: boolean) => (active ? FIGMA_ICON_COLOR_ACTIVE : FIGMA_ICON_COLOR);

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isMobileSidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}
      
      <aside className={cn(
        "flex flex-col w-[260px] min-h-[calc(100vh-24px)] my-3 mx-3 md:ml-3 bg-white rounded-[28px] fixed left-0 top-0 z-50 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_24px_rgba(0,0,0,0.04)] border border-[#F0F0F0] veda-body transition-transform duration-300 ease-in-out",
        isMobileSidebarOpen ? "translate-x-0" : "-translate-x-[110%] md:translate-x-0"
      )}>
        <div className="px-6 pt-7 pb-5">
          <VedaAIWordmark href="/assignments" />
        </div>

      <div className="px-5 pb-6">
        <PrimaryButton
          href="/assignments/create"
          variant="sidebar"
          fullWidth
          icon={<IconSparkles className="shrink-0" />}
        >
          Create Assignment
        </PrimaryButton>
      </div>

      <nav className="flex-1 px-3 space-y-0.5">
        {navItems.map((item) => {
          const isActive =
            pathname.startsWith(item.href) && (item.href !== '/' || pathname === '/');
          const badgeCount = item.showCount ? assignments.length : 0;
          const { Icon } = item;

          return (
            <Link
              key={item.label}
              href={item.href}
              className={navLinkClass(isActive)}
              onClick={() => setMobileSidebarOpen(false)}
            >
              <span className="w-5 h-5 flex items-center justify-center shrink-0">
                <Icon className={iconClass(isActive)} />
              </span>
              <span className="flex-1">{item.label}</span>
              {badgeCount > 0 && (
                <span className="veda-body flex items-center justify-center min-w-[22px] h-[18px] px-1.5 text-[12px] font-normal text-white bg-[#E8762A] rounded-full leading-none">
                  {badgeCount > 99 ? '99+' : badgeCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 pb-3">
        <Link 
          href="/profile" 
          className={`veda-body flex items-center gap-3 px-3 py-2.5 rounded-xl ${pathname === '/profile' ? 'text-[#1A1A1A] font-medium' : 'text-[#5E5E5E]/80 font-normal'}`}
        >
          <span className="w-5 h-5 flex items-center justify-center shrink-0">
            <IconSettings className={iconClass(pathname === '/profile')} />
          </span>
          <span>Settings</span>
        </Link>
      </div>

      <Link
        href="/profile"
        className="mx-4 mb-5 p-3 bg-[#F0F0F0] rounded-2xl block"
      >
        <div className="flex items-center gap-3">
          <ProfileAvatar size="xl" />
          <div className="min-w-0">
            <p className="text-[16px] font-semibold text-[#1A1A1A] truncate leading-[140%] tracking-[-0.04em]">
              {schoolLines.primary}
            </p>
            {schoolLines.secondary && (
              <p className="text-[14px] font-normal text-[#5E5E5E]/80 truncate leading-[140%] tracking-[-0.04em] mt-0.5">
                {schoolLines.secondary}
              </p>
            )}
          </div>
        </div>
      </Link>
    </aside>
    </>
  );
}
