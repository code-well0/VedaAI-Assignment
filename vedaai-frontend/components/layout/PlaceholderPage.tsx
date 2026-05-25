'use client';

import AppShell from '@/components/layout/AppShell';
import PrimaryButton from '@/components/ui/PrimaryButton';
import { IconAssignments } from '@/components/icons/SidebarIcons';

interface PlaceholderPageProps {
  title: string;
}

/** Shell pages (Library, Groups, etc.) — header + sidebar + CTA to assignments */
export default function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <AppShell>
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-140px)] px-4 md:px-6">
        <PrimaryButton
          href="/assignments"
          variant="dark"
          icon={
            <span className="w-5 h-5 flex items-center justify-center">
              <IconAssignments className="text-white" />
            </span>
          }
        >
          Go to Assignments
        </PrimaryButton>
        <p className="sr-only">{title} — redirect to assignments</p>
      </div>
    </AppShell>
  );
}
