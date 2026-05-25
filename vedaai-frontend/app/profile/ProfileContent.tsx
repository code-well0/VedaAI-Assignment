'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import TeacherProfileForm from '@/components/profile/TeacherProfileForm';
import TeacherProfileCard from '@/components/profile/TeacherProfileCard';
import { useProfileStore, getAssignmentFieldsFromProfile } from '@/lib/profileStore';
import { useAssignmentStore } from '@/lib/store';

export default function ProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isSetup = searchParams.get('setup') === '1';

  const { profile, isComplete, hasHydrated, saveProfile } = useProfileStore();
  const { setCreateForm } = useAssignmentStore();
  const [editing, setEditing] = useState(!isComplete);

  useEffect(() => {
    if (hasHydrated && !isComplete) {
      setEditing(true);
    }
  }, [hasHydrated, isComplete]);

  const handleSave = async (saved: typeof profile) => {
    try {
      await saveProfile(saved);
      setCreateForm(getAssignmentFieldsFromProfile(saved));
      setEditing(false);

      if (isSetup) {
        router.push('/assignments');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save profile';
      alert(message);
    }
  };

  if (!hasHydrated) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-[#E5E7EB] border-t-[#E8762A] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-lg mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2.5 h-2.5 rounded-full bg-[#22C55E]" />
          <h1 className="text-xl font-bold text-[#1F2937]">Teacher Profile</h1>
        </div>
        <p className="text-sm text-[#9CA3AF] ml-[18px]">
          {isSetup
            ? 'Set up your profile to personalize assignments and question papers.'
            : 'Manage your teaching details used across VedaAI.'}
        </p>
      </div>

      {isSetup && !isComplete && (
        <div className="mb-4 text-sm text-[#92400E] bg-[#FFFBEB] border border-[#FDE68A] rounded-lg px-4 py-3">
          Complete your profile before creating assignments.
        </div>
      )}

      {editing || !isComplete ? (
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 md:p-8 shadow-sm">
          <h2 className="text-base font-bold text-[#1F2937] mb-1">
            {isComplete ? 'Edit your details' : 'Create your teacher profile'}
          </h2>
          <p className="text-sm text-[#9CA3AF] mb-6">
            Enter your name, school, subject, and the classes you teach.
          </p>
          <TeacherProfileForm
            initial={profile}
            onSave={handleSave}
            submitLabel={isComplete ? 'Update Profile' : 'Create Profile'}
          />
          {isComplete && (
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="w-full mt-3 py-2.5 text-sm font-medium text-[#6B7280] hover:text-[#1F2937] transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      ) : (
        <TeacherProfileCard profile={profile} onEdit={() => setEditing(true)} />
      )}
    </div>
  );
}
