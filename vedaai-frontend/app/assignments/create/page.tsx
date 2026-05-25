'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppShell from '@/components/layout/AppShell';
import StepProgressBar from '@/components/assignments/create/StepProgressBar';
import AssignmentDetailsStep from '@/components/assignments/create/AssignmentDetailsStep';
import ReviewConfirmStep from '@/components/assignments/create/ReviewConfirmStep';
import { useAssignmentStore } from '@/lib/store';
import { validateAssignmentStep, validateReviewStep } from '@/lib/validation';
import { useProfileStore, getAssignmentFieldsFromProfile } from '@/lib/profileStore';
import { ArrowLeft, ArrowRight, Sparkles, Loader2 } from 'lucide-react';

export default function CreateAssignmentPage() {
  const router = useRouter();
  const { createForm, setStep, createAssignment, resetCreateForm, setCreateForm } = useAssignmentStore();
  const { profile, isComplete, hasHydrated } = useProfileStore();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (hasHydrated && !isComplete) {
      router.replace('/profile?setup=1');
      return;
    }
    if (hasHydrated && isComplete) {
      setCreateForm(getAssignmentFieldsFromProfile(profile));
    }
  }, [hasHydrated, isComplete, profile, router, setCreateForm]);

  const totalQuestions = createForm.questionTypes.reduce((sum, qt) => sum + qt.count, 0);
  const totalMarks = createForm.questionTypes.reduce((sum, qt) => sum + qt.count * qt.marks, 0);

  const handleNext = async () => {
    if (createForm.currentStep < 1) {
      const validationError = validateAssignmentStep(createForm);
      if (validationError) {
        alert(validationError);
        return;
      }
      setStep(createForm.currentStep + 1);
    } else {
      const reviewError = validateReviewStep(createForm);
      if (reviewError) {
        alert(reviewError);
        return;
      }
      setSubmitting(true);
      try {
        const newAssignment = await createAssignment();
        resetCreateForm();
        router.push(`/assignments/${newAssignment.id}`);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to generate assignment. Please try again.';
        alert(message);
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handlePrevious = () => {
    if (createForm.currentStep > 0) {
      setStep(createForm.currentStep - 1);
    } else {
      router.push('/assignments');
    }
  };

  if (!hasHydrated || !isComplete) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="w-10 h-10 border-4 border-[#E5E7EB] border-t-[#E8762A] rounded-full animate-spin" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="p-4 md:p-6 max-w-3xl mx-auto">
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2.5 h-2.5 rounded-full bg-[#22C55E]" />
            <h1 className="text-xl font-bold text-[#1F2937]">Create Assignment</h1>
          </div>
          <p className="text-sm text-[#9CA3AF] ml-[18px]">Set up a new assignment for your students</p>
        </div>

        <StepProgressBar currentStep={createForm.currentStep} totalSteps={2} />

        <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 md:p-8 shadow-sm">
          {createForm.currentStep === 0 && <AssignmentDetailsStep />}
          {createForm.currentStep === 1 && (
            <ReviewConfirmStep
              profile={profile}
              totalQuestions={totalQuestions}
              totalMarks={totalMarks}
            />
          )}
        </div>

        <div className="flex justify-between mt-6">
          <button
            onClick={handlePrevious}
            disabled={submitting}
            type="button"
            className="flex items-center justify-center gap-1 px-6 py-3 min-h-[46px] min-w-[134px] text-[14px] font-semibold text-[#1F2937] border-[1.5px] border-[#E5E7EB] bg-white rounded-full hover:bg-[#F9FAFB] disabled:opacity-50 transition-colors"
          >
            <ArrowLeft size={16} />
            Previous
          </button>

          <button
            onClick={handleNext}
            disabled={submitting}
            type="button"
            className="flex items-center justify-center gap-2 px-6 py-3 min-h-[46px] min-w-[106px] text-[14px] font-semibold text-white bg-[#1F2937] border-[1.5px] border-[#1F2937] rounded-full hover:bg-[#374151] disabled:opacity-50 transition-colors cursor-pointer shadow-sm"
          >
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Generating with ChatGPT...
              </>
            ) : createForm.currentStep === 1 ? (
              <>
                <Sparkles size={16} className="text-[#F5A623] animate-pulse" />
                Generate Quiz with AI
              </>
            ) : (
              <>
                Next
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </div>
      </div>
    </AppShell>
  );
}
