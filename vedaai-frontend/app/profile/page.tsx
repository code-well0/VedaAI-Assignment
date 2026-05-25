import { Suspense } from 'react';
import AppShell from '@/components/layout/AppShell';
import ProfileContent from './ProfileContent';

export default function ProfilePage() {
  return (
    <AppShell>
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="w-10 h-10 border-4 border-[#E5E7EB] border-t-[#E8762A] rounded-full animate-spin" />
          </div>
        }
      >
        <ProfileContent />
      </Suspense>
    </AppShell>
  );
}
