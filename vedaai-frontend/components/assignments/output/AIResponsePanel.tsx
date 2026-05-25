'use client';

import { Download, Sparkles } from 'lucide-react';
import { Assignment } from '@/lib/store';
import { ASSIGNMENTS_API } from '@/lib/config';
import { buildTeacherIntroMessage } from '@/lib/assignmentIntro';
import { useProfileStore } from '@/lib/profileStore';

interface AIResponsePanelProps {
  assignment: Assignment;
  onRegenerate: () => void;
}

export default function AIResponsePanel({ assignment, onRegenerate }: AIResponsePanelProps) {
  const profileName = useProfileStore((s) => s.profile.name);

  const introText = buildTeacherIntroMessage(assignment, profileName);

  const handleDownload = () => {
    window.open(`${ASSIGNMENTS_API}/${assignment.id}/pdf`, '_blank');
  };

  return (
    <div className="bg-[#202020] text-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-800 w-full">
      <p className="text-sm md:text-base leading-relaxed text-gray-200 font-medium">
        {introText}
      </p>

      <div className="flex flex-wrap items-center gap-3 mt-4">
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-gray-100 text-black text-xs font-bold rounded-full shadow-sm transition-colors cursor-pointer"
        >
          <Download size={14} className="text-black" />
          Download as PDF
        </button>

        <button
          onClick={onRegenerate}
          className="flex items-center gap-2 px-5 py-2.5 bg-transparent hover:bg-gray-800 border border-gray-700 hover:border-gray-600 text-gray-300 hover:text-white text-xs font-bold rounded-full transition-all cursor-pointer"
        >
          <Sparkles size={12} className="text-[#F5A623] animate-pulse" />
          Regenerate Paper
        </button>
      </div>
    </div>
  );
}
