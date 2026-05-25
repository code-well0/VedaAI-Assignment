'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Plus } from 'lucide-react';
import {
  IconMobileHome,
  IconMobileAssignments,
  IconMobileLibrary,
  IconMobileToolkit,
} from '@/components/icons/MobileNavIcons';

const navItems = [
  { label: 'Home', href: '/', icon: IconMobileHome },
  { label: 'Assignments', href: '/assignments', icon: IconMobileAssignments },
  { label: 'Library', href: '/library', icon: IconMobileLibrary },
  { label: 'AI Toolkit', href: '/ai-toolkit', icon: IconMobileToolkit },
];

export default function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <>
      {/* FAB - Create Assignment */}
      <div className="md:hidden fixed bottom-[100px] right-6 z-50">
        <Link
          href="/assignments/create"
          className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-transform hover:scale-105 active:scale-95"
          aria-label="Create Assignment"
        >
          <Plus size={26} className="text-[#E8762A]" strokeWidth={2.5} />
        </Link>
      </div>

      {/* Bottom Nav Pill */}
      <nav className="md:hidden fixed bottom-6 left-4 right-4 z-40 bg-[#1A1A1A] rounded-[32px] flex items-center justify-around py-3.5 px-2 shadow-xl safe-bottom">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href) && (item.href !== '/' || pathname === '/');
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center gap-1.5 px-3 transition-colors ${
                isActive
                  ? 'text-white'
                  : 'text-[#858585] hover:text-[#D1D5DB]'
              }`}
            >
              <Icon className="w-6 h-6 shrink-0" />
              <span className={`text-[11px] font-medium leading-none ${isActive ? 'text-white' : ''}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
