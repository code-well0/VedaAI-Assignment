'use client';

import { useEffect } from 'react';
import { useAssignmentStore } from '@/lib/store';
import { useProfileStore } from '@/lib/profileStore';
import AppShell from '@/components/layout/AppShell';
import AssignmentGrid from '@/components/assignments/AssignmentGrid';
import NoAssignmentsIllustration from '@/components/illustrations/NoAssignments';
import Link from 'next/link';
import PrimaryButton from '@/components/ui/PrimaryButton';
import { Plus } from 'lucide-react';

export default function AssignmentsPage() {
  const { assignments, fetchAssignments, loading } = useAssignmentStore();
  const { isComplete, hasHydrated } = useProfileStore();

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  return (
    <AppShell>
      {hasHydrated && !isComplete && (
        <div className="mx-4 md:mx-6 mt-4 text-sm text-[#92400E] bg-[#FFFBEB] border border-[#FDE68A] rounded-xl px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <span>Complete your teacher profile to personalize assignments and question papers.</span>
          <Link
            href="/profile?setup=1"
            className="text-sm font-semibold text-[#1F2937] underline underline-offset-2 whitespace-nowrap"
          >
            Set up profile →
          </Link>
        </div>
      )}
      {loading && assignments.length === 0 ? (
        /* Loading State */
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-56px)] px-4">
          <div className="w-10 h-10 border-4 border-[#E5E7EB] border-t-[#E8762A] rounded-full animate-spin" />
          <p className="mt-4 text-sm font-medium text-[#6B7280]">Loading your assignments...</p>
        </div>
      ) : assignments.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-56px)] px-4">
          <NoAssignmentsIllustration />
          <h2 className="mt-6 text-[16px] font-semibold text-[#1A1A1A] leading-[140%] tracking-[-0.04em]">
            No assignments yet
          </h2>
          <p className="veda-body mt-2 text-[#5E5E5E]/80 text-center max-w-md">
            Create your first assignment to start collecting and grading student
            submissions. You can set up rubrics, define marking criteria, and let AI
            assist with grading.
          </p>
          <div className="mt-6">
            <PrimaryButton
              href={isComplete ? '/assignments/create' : '/profile?setup=1'}
              variant="dark"
              icon={<Plus className="w-5 h-5 shrink-0 text-white" strokeWidth={2.5} />}
            >
              {isComplete ? 'Create Your First Assignment' : 'Set Up Your Profile First'}
            </PrimaryButton>
          </div>
        </div>
      ) : (
        /* Filled State */
        <AssignmentGrid />
      )}
    </AppShell>
  );
}
