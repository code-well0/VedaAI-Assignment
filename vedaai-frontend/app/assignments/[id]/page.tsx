'use client';

import { use } from 'react';
import AppShell from '@/components/layout/AppShell';
import AIResponsePanel from '@/components/assignments/output/AIResponsePanel';
import QuestionPaperPreview from '@/components/assignments/output/QuestionPaperPreview';
import { useAssignmentStore } from '@/lib/store';
import { useAssignmentGeneration } from '@/lib/useAssignmentGeneration';
import { Sparkles, Loader2, AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function AssignmentOutputPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { fetchAssignmentDetails, regenerateAssignment } = useAssignmentStore();

  const {
    assignment,
    loading,
    error,
    phase,
    setLoading,
    setError,
    startRegeneration,
    reload,
  } = useAssignmentGeneration(id, fetchAssignmentDetails);

  const handleRegenerate = async () => {
    try {
      startRegeneration();
      await regenerateAssignment(id);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to restart generation';
      setError(message);
      setLoading(false);
      await reload();
    }
  };

  const status = assignment?.status;

  return (
    <AppShell>
      <div className="p-4 md:p-6 max-w-7xl mx-auto min-h-[calc(100vh-56px)] flex flex-col">
        <div className="mb-4 flex items-center justify-between">
          <Link
            href="/assignments"
            className="flex items-center gap-2 text-sm font-medium text-[#4B5563] hover:text-[#1F2937] transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Assignments
          </Link>
        </div>

        {loading || status === 'pending' ? (
          <div className="flex-1 flex flex-col items-center justify-center bg-white border border-[#E5E7EB] rounded-2xl p-8 md:p-16 shadow-sm my-auto">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-[#E8762A]/10 rounded-full blur-xl animate-pulse" />
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#E8762A] to-[#F5A623] flex items-center justify-center shadow-lg relative border border-white/20">
                <Sparkles size={36} className="text-white animate-spin [animation-duration:8s]" />
              </div>
            </div>

            <h2 className="text-xl font-bold text-[#1F2937] text-center">
              VedaAI is building your question paper
            </h2>
            <p className="mt-2 text-sm text-[#9CA3AF] text-center max-w-sm">
              Creating a CBSE/NCERT-aligned evaluation sheet based on your syllabus specifications.
            </p>

            <div className="mt-8 space-y-3.5 w-full max-w-md text-sm border-t border-[#F3F4F6] pt-6">
              {[
                'Checking assignment parameters',
                'Structuring CBSE/NCERT syllabus details',
                'Generating high-fidelity questions with AI',
                'Compiling solutions and marking key',
              ].map((label, index) => (
                <div key={label} className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                      phase >= index
                        ? 'bg-[#22C55E] text-white'
                        : phase === index - 1
                          ? 'bg-[#E8762A] text-white animate-pulse'
                          : 'border border-gray-300'
                    }`}
                  >
                    {phase >= index ? '✓' : '•'}
                  </div>
                  <span
                    className={
                      phase >= index
                        ? 'text-[#374151] font-semibold'
                        : phase === index - 1
                          ? 'text-[#E8762A] font-semibold'
                          : 'text-[#9CA3AF]'
                    }
                  >
                    {label}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-8 flex items-center gap-2 text-xs font-semibold text-[#6B7280] bg-[#F9FAFB] border border-[#E5E7EB] px-3.5 py-1.5 rounded-full">
              <Loader2 size={12} className="animate-spin text-[#E8762A]" />
              Real-time update stream active via WebSocket
            </div>
          </div>
        ) : status === 'failed' || error ? (
          <div className="flex-1 flex flex-col items-center justify-center bg-white border border-[#E5E7EB] rounded-2xl p-8 md:p-16 shadow-sm my-auto">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-red-500 mb-6">
              <AlertCircle size={36} />
            </div>

            <h2 className="text-xl font-bold text-[#1F2937] text-center">
              {error?.includes('not found') ? 'Assignment Not Found' : 'Something Went Wrong'}
            </h2>
            <p className="mt-2 text-sm text-[#EF4444] text-center max-w-md bg-red-50 border border-red-100 rounded-lg p-3 leading-relaxed">
              {error || 'The background AI worker ran into an error generating the assessment.'}
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              {!error?.includes('not found') && !error?.includes('Backend is not running') && (
                <button
                  onClick={handleRegenerate}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#1F2937] hover:bg-[#374151] text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
                >
                  <RefreshCw size={14} />
                  Try Regenerating Again
                </button>
              )}
              <Link
                href="/assignments/create"
                className="flex items-center gap-2 px-5 py-2.5 bg-[#E8762A] hover:bg-[#d96820] text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
              >
                Create New Assignment
              </Link>
              <Link
                href="/assignments"
                className="text-sm font-medium text-[#4B5563] hover:text-[#1F2937] underline"
              >
                Back to list
              </Link>
            </div>
          </div>
        ) : (
          assignment && (
            <div className="flex flex-col gap-6 flex-1 w-full max-w-4xl mx-auto pb-10">
              <AIResponsePanel assignment={assignment} onRegenerate={handleRegenerate} />
              <QuestionPaperPreview assignment={assignment} />
            </div>
          )
        )}
      </div>
    </AppShell>
  );
}
